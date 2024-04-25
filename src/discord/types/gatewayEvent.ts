import type { GatewayOpcode } from "./gatewayOpcode";
import type { Intent } from "./intent";
import type { Application } from "./application";
import type { UnavailableGuild } from "./unavailableGuild";
import type { UpdatePresence } from "./updatePresence";
import type { User } from "./user";
import type { Interaction } from "./interaction";
import type { MessageCreateMessage, MessageDeleteMessage } from "./message";

interface GatewayHello {
	heartbeat_interval: number;
}

interface GatewayIdentify {
	token: string;
	properties: {
		os: string;
		browser: string;
		device: string;
	};
	compress?: boolean;
	large_threshold?: number;
	shard?: [number, number];
	presence?: UpdatePresence;
	intents: Intent;
}

interface GatewayResume {
	token: string;
	session_id: string;
	seq: number;
}

interface GatewayReady {
	user: User;
	guilds: UnavailableGuild[];
	session_id: string;
	resume_gateway_url: string;
	shard?: [number, number];
	application: Pick<Application, "name" | "id">;
}

export type DispatchEvent =
	| { t: "INTERACTION_CREATE"; d: Interaction }
	| { t: "READY"; d: GatewayReady }
	| { t: "RESUMED"; d: undefined }
	| { t: "MESSAGE_CREATE"; d: MessageCreateMessage }
	| { t: "MESSAGE_UPDATE"; d: Partial<MessageCreateMessage> & Pick<MessageCreateMessage, "id" | "channel_id"> }
	| { t: "MESSAGE_DELETE"; d: MessageDeleteMessage };

export type GatewayEvent =
	| { op: GatewayOpcode.Hello; d: GatewayHello }
	| { op: GatewayOpcode.Reconnect }
	| { op: GatewayOpcode.Heartbeat; d?: number }
	| { op: GatewayOpcode.Identify; d: GatewayIdentify }
	| { op: GatewayOpcode.InvalidSession; d: boolean }
	| { op: GatewayOpcode.Resume; d: GatewayResume }
	| { op: GatewayOpcode.HeartbackAck }
	| { op: GatewayOpcode.PresenceUpdate; d: UpdatePresence }
	| ({ op: GatewayOpcode.Dispatch; s: number } & DispatchEvent);
