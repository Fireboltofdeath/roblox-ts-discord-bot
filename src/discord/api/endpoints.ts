import type { ApplicationCreateGlobalCommand } from "../types/interaction";
import type { ChannelCreateMessage } from "../types/message";

export enum InteractionCallbackType {
	Pong = 1,
	ChannelMessageWithSource = 4,
	DeferredChannelMessageWithSource = 5,
	DeferredUpdateMessage = 6,
	UpdateMessage = 7,
	ApplicationCommandAutocompleteResult = 8,
	Modal = 9,
	PremiumRequired = 10,
}

export interface InteractionCallbackDataMessage {
	tts?: boolean;
	content?: string;
	embeds?: unknown[];
	allowed_mentions?: unknown[];
	flags?: number;
	components?: unknown;
	attachments?: unknown[];
	poll?: unknown;
}

export type InteractionCallbackPost =
	| { type: InteractionCallbackType.Pong }
	| { type: InteractionCallbackType.DeferredChannelMessageWithSource; data: InteractionCallbackDataMessage }
	| { type: InteractionCallbackType.DeferredUpdateMessage }
	| { type: InteractionCallbackType.ChannelMessageWithSource; data: InteractionCallbackDataMessage }
	| { type: InteractionCallbackType.UpdateMessage; data: InteractionCallbackDataMessage }
	| { type: InteractionCallbackType.Modal; data: unknown }
	| { type: InteractionCallbackType.ApplicationCommandAutocompleteResult; data: unknown }
	| { type: InteractionCallbackType.PremiumRequired; data: unknown };

export type ApiEndpoints =
	| { path: `/interactions/${string}/${string}/callback`; data: InteractionCallbackPost }
	| { path: `/webhooks/${string}/${string}`; data: InteractionCallbackDataMessage }
	| { path: `/channels/${string}/messages`; data: ChannelCreateMessage }
	| { path: `/applications/${string}/commands`; data: ApplicationCreateGlobalCommand[] };

export type ApiPaths = ApiEndpoints["path"];
