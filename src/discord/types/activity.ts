export enum ActivityType {
	Game,
	Streaming,
	Listening,
	Watching,
	Custom,
	Competing,
}

export interface Activity {
	name: string;
	type: ActivityType;
	url?: string;
	created_at: number;
	details?: string;
	state?: string;
	emoji?: unknown;
	party?: unknown;
	assets?: unknown;
	secrets?: unknown;
	instance?: boolean;
	flags?: number;
	buttons?: unknown;
}
