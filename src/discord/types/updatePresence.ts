import type { Activity } from "./activity";
import type { Status } from "./status";

export interface UpdatePresence {
	since: number | undefined;
	activities: Activity[];
	status: Status;
	afk: boolean;
}
