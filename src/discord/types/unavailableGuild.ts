export interface UnavailableGuild {
	id: string;
	name: string;
	icon?: string;
	splash?: string;
	discovery_splash?: string;
	emojis: unknown[];
	features: string[];
	approximate_member_count: number;
	approximate_presence_count: number;
	description?: string;
	stickers: unknown[];
}
