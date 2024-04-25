import type { Message } from "./message";
import type { User } from "./user";

export enum InteractionType {
	Ping = 1,
	ApplicationCommand,
	MessageComponent,
	ApplicationCommandAutocomplete,
	ModalSubmit,
}

export enum InteractionOptionType {
	SubCommand = 1,
	SubCommandGroup,
	String,
	Integer,
	Boolean,
	User,
	Channel,
	Role,
	Mentionable,
	Number,
	Attachment,
}

export enum ApplicationCommandType {
	ChatInput = 1,
	User,
	Message,
}

export interface InteractionData {
	id: string;
	name: string;
	type: number;
	resolved?: InteractionResolved;
	options?: InteractionDataOption[];
	guild_id?: string;
	target_id?: string;
}

export type InteractionDataOption = {
	name: string;
	focused?: boolean;
} & (
	| { type: InteractionOptionType.String; value: string }
	| { type: InteractionOptionType.Boolean; value: boolean }
	| { type: InteractionOptionType.Number | InteractionOptionType.Integer; value: number }
	| { type: never; value: unknown }
);

export interface InteractionResolved {
	users?: Map<string, User>;
	members?: Map<string, unknown>;
	roles?: Map<string, unknown>;
	channels?: Map<string, unknown>;
	messages?: Map<string, Message>;
	attachments?: Map<string, unknown>;
}

export interface ApplicationCommandChoice {
	name: string;
	value: string | number;
}

export interface ApplicationCommandOption {
	type: InteractionOptionType;
	name: string;
	description: string;
	required?: boolean;
	choices?: ApplicationCommandChoice[];
	options?: ApplicationCommandOption[];
	channel_types?: unknown[];
	min_value?: number;
	max_value?: number;
	min_length?: number;
	max_length?: number;
	autocomplete?: boolean;
}

export interface ApplicationCreateGlobalCommand {
	name: string;
	description?: string;
	options?: ApplicationCommandOption[];
	default_member_permissions?: string;
	dm_permission?: boolean;
	default_permission?: boolean;
	integration_types?: unknown[];
	contexts?: unknown[];
	type?: ApplicationCommandType;
	nsfw?: boolean;
}

export interface Interaction {
	id: string;
	application_id: string;
	type: InteractionType;
	data?: InteractionData;
	guild_id?: string;
	channel?: unknown;
	channel_id?: string;
	member?: unknown;
	user?: User;
	token: string;
	version: number;
	message?: unknown;
	app_permissions: string;
	locale?: string;
	guild_locale?: string;
	entitlements: unknown[];
	authorizing_integration_owners: unknown;
	context?: unknown;
}
