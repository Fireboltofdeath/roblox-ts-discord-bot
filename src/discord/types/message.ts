import type { User } from "./user";

export const enum MessageFlags {
	Crossposted = 1 << 0,
	IsCrosspost = 1 << 1,
	SuppressEmbeds = 1 << 2,
	SourceMessageDeleted = 1 << 3,
	Urgent = 1 << 4,
	HasThread = 1 << 5,
	Ephemeral = 1 << 6,
	Loading = 1 << 7,
	FailedToMentionSomeRolesInThread = 1 << 8,
	SuppressNotifications = 1 << 12,
	IsVoiceMessage = 1 << 13,
}

export enum MessageType {
	Default,
	RecipientAdd,
	RecipientRemove,
	Call,
	ChannelNameChange,
	ChannelIconChange,
	ChannelPinnedMessage,
	UserJoin,
	GuildBoost,
	GuildBoostTier1,
	GuildBoostTier2,
	GuildBoostTier3,
	ChannelFollowAdd,
	GuildDiscoveryDisqualified = 14,
	GuildDiscoveryRequalified,
	GuildDiscoveryGracePeriodInitialWarning,
	GuildDiscoveryGracePeriodFinalWarning,
	ThreadCreated,
	Reply,
	ChatInputCommand,
	ThreadStarterMessage,
	GuildInviteReminder,
	ContextMenuCommand,
	AutoModerationAction,
	RoleSubscriptionPurchase,
	InteractionPremiumUpsell,
	StageStart,
	StageEnd,
	StageSpeaker,
	StageTopic = 31,
	GuildApplicationPremiumSubscription,
}

export interface Message {
	id: string;
	channel_id: string;
	author: User;
	content: string;
	timestamp: string;
	edited_timestamp: string;
	tts: boolean;
	mention_everyone: boolean;
	mentions: User[];
	mentiion_roles: unknown[];
	mention_channels?: unknown[];
	attachments?: unknown[];
	embeds?: unknown[];
	reactions?: unknown[];
	nonce?: string | number;
	pinned: boolean;
	webhook_id?: string;
	type: MessageType;
	activity?: unknown;
	application?: unknown;
	application_id?: string;
	message_reference?: unknown;
	flags: MessageFlags;
	referenced_message?: Message;
	interaction_metadata?: unknown;
	interaction?: unknown;
	thread?: unknown;
	components?: unknown[];
	sticker_items?: unknown[];
	stickers?: unknown[];
	position?: number;
	role_subscription_data?: unknown;
	resolved?: unknown;
	poll?: unknown;
}

export interface MessageCreateMessage extends Message {
	guild_id?: string;
	member?: unknown;
	mentions: (User & { member: unknown })[];
}

export interface MessageDeleteMessage {
	id: string;
	channel_id: string;
	guild_id?: string;
}

export interface ChannelCreateMessage {
	content?: string;
	nonce?: number | string;
	tts?: boolean;
	embeds?: unknown[];
	allowed_mentions?: unknown[];
	message_reference?: unknown;
	components?: unknown[];
	sticker_ids?: string[];
	files?: unknown[];
	payload_json?: string;
	attachments?: unknown[];
	flags?: MessageFlags;
	enforce_nonce?: boolean;
	poll?: unknown;
}
