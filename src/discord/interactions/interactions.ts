import type { ApiClient } from "../apiClient";
import type { ApplicationCreateGlobalCommand, Interaction } from "../types/interaction";
import { InteractionResponse } from "./interactionResponse";

export class Interactions {
	private commands = new Array<ApplicationCreateGlobalCommand>();

	constructor(private client: ApiClient) {}

	public createInteractionResponse(interaction: Interaction) {
		return new InteractionResponse(interaction, this.client);
	}

	public registerCommand(command: ApplicationCreateGlobalCommand) {
		this.commands.push(command);
	}

	public overwriteCommands() {
		this.client.put(`/applications/${this.client.appId}/commands`, this.commands);
	}
}
