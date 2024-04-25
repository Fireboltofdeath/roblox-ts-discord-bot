import { HttpService } from "@rbxts/services";
import WebSocket from "../websocket";
import type { DispatchEvent, GatewayEvent } from "./types/gatewayEvent";
import { GatewayOpcode } from "./types/gatewayOpcode";
import { Intent } from "./types/intent";
import { Status } from "./types/status";
import { ActivityType } from "./types/activity";
import { InteractionOptionType, InteractionType } from "./types/interaction";
import { ApiEndpoints, InteractionCallbackType } from "./api/endpoints";
import { ApiClient } from "./apiClient";
import { Interactions } from "./interactions/interactions";
import type { UpdatePresence } from "./types/updatePresence";

declare function newproxy(): undefined;

const NULL = newproxy();
const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";

interface Session {
	id: string;
	token: string;
	gateway: string;
	sequence: number;
}

export class DiscordBot {
	public static getApiClient(bot: DiscordBot) {
		return bot.client;
	}

	private socket!: WebSocket.WebSocket;

	private cachedInteractions?: Interactions;
	private client: ApiClient;
	private session?: Session;
	private heartbeatInterval = 0;
	private heartbeatThread?: thread;
	private dispatchEvents = new Map<DispatchEvent["t"], Callback[]>();
	private resuming = false;
	private currentPresence?: UpdatePresence;
	private hasIdentified = false;

	private startHeartbeat() {
		if (this.heartbeatThread) {
			task.cancel(this.heartbeatThread);
		}

		this.heartbeatThread = task.spawn(() => {
			// Jitter the initial heartbeat.
			task.wait(this.heartbeatInterval * math.random());

			while (this.socket.connected) {
				this.send({
					op: GatewayOpcode.Heartbeat,
					d: this.session?.sequence ?? NULL,
				});

				task.wait(this.heartbeatInterval);
			}
		});
	}

	private handleDispatchEvent(event: GatewayEvent & { op: GatewayOpcode.Dispatch }) {
		if (event.t === "READY") {
			this.session = {
				gateway: event.d.resume_gateway_url + "/?v=10&encoding=json",
				id: event.d.session_id,
				token: event.d.session_id,
				sequence: event.s,
			};
		} else if (event.t === "RESUMED") {
			this.resuming = false;
		}

		const callbacks = this.dispatchEvents.get(event.t);
		if (callbacks) {
			for (const callback of callbacks) {
				task.spawn(callback, event.d);
			}
		}

		if (this.session) {
			this.session.sequence = event.s ?? this.session.sequence;
		}
	}

	private handleGatewayEvent(event: GatewayEvent) {
		if (event.op === GatewayOpcode.Hello) {
			this.heartbeatInterval = event.d.heartbeat_interval / 1000;
			this.startHeartbeat();
			this.beginSession();
		} else if (event.op === GatewayOpcode.Heartbeat) {
			this.send({ op: GatewayOpcode.Heartbeat, d: this.session?.sequence ?? NULL });
		} else if (event.op === GatewayOpcode.Dispatch) {
			this.handleDispatchEvent(event);
		} else if (event.op === GatewayOpcode.InvalidSession) {
			if (!event.d) {
				this.session = undefined;
			}

			print("Invalid session!");

			this.socket.close();
		} else if (event.op === GatewayOpcode.Reconnect) {
			this.socket.close();
		} else if (event.op === GatewayOpcode.HeartbackAck) {
			// We don't need to do anything here.
		} else {
			print("unhandled event", event);
		}
	}

	private beginSession() {
		if (this.session) {
			this.send({
				op: GatewayOpcode.Resume,
				d: {
					token: this.token,
					session_id: this.session.id,
					seq: this.session.sequence!,
				},
			});
		} else {
			this.hasIdentified = true;
			this.send({
				op: GatewayOpcode.Identify,
				d: {
					token: this.token,
					properties: {
						os: "Windows",
						browser: "Roblox Bot",
						device: "Roblox Bot",
					},
					intents: Intent.MessageContent | Intent.GuildMessages,
					presence: this.currentPresence,
				},
			});
		}
	}

	private resume() {
		assert(this.session);

		this.socket = new WebSocket({ url: this.session.gateway });

		const [success, reason] = this.socket.connect();
		if (!success) {
			warn("Socket could not connect to resume gateway: " + reason);
			this.session = undefined;
			this.connect();
			return;
		}

		this.resuming = true;
		this.connectSocketHandlers();
	}

	private connect() {
		if (this.socket && this.socket.connected) {
			error("Socket is already connected");
		}

		if (this.session) {
			return this.resume();
		}

		this.resuming = false;
		this.session = undefined;
		this.socket = new WebSocket({ url: GATEWAY_URL });

		const [success, reason] = this.socket.connect();
		if (!success) {
			error("Socket could not connect: " + reason);
		}

		this.connectSocketHandlers();
	}

	private connectSocketHandlers() {
		this.socket.onMessaged((value) => {
			this.handleGatewayEvent(HttpService.JSONDecode(value) as GatewayEvent);
		});

		this.socket.onClosed((code, reason) => {
			if (this.heartbeatThread) {
				task.cancel(this.heartbeatThread);
			}

			if ((code >= 4000 && code <= 4009 && code !== 4004) || (code >= 1002 && code < 2000)) {
				print("Socket closed, attempting reconnect", code, reason);
				this.connect();
			} else {
				print("Socket closed, cannot reconnect", code, reason);
			}
		});
	}

	private send(event: GatewayEvent) {
		this.socket.send(HttpService.JSONEncode(event));
	}

	constructor(
		private token: string,
		private appId: string,
	) {
		this.client = new ApiClient(token, appId);
	}

	public start() {
		this.connect();
	}

	public stop() {
		this.socket.close(1000);
	}

	public interactions() {
		return (this.cachedInteractions ??= new Interactions(this.client));
	}

	public message(channel_id: string, content: string) {
		this.client.post(`/channels/${channel_id}/messages`, { content });
	}

	public setPresence(presence: UpdatePresence) {
		this.currentPresence = presence;

		if (this.hasIdentified) {
			this.send({
				op: GatewayOpcode.PresenceUpdate,
				d: presence,
			});
		}
	}

	public connectDispatch<E extends DispatchEvent["t"]>(
		event: E,
		callback: (data: (DispatchEvent & { t: E; d: unknown })["d"]) => void,
	) {
		let callbacks = this.dispatchEvents.get(event);
		if (!callbacks) this.dispatchEvents.set(event, (callbacks = []));

		callbacks.push(callback);
	}
}
