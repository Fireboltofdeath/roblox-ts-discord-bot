import { InteractionCallbackType, type ApiEndpoints, type ApiPaths } from "../api/endpoints";
import type { ApiClient } from "../apiClient";
import type { Interaction } from "../types/interaction";
import { MessageFlags } from "../types/message";

export class InteractionResponse {
	private id;
	private token;
	private isAcknowledged = false;

	constructor(
		private interaction: Interaction,
		private client: ApiClient,
	) {
		this.id = interaction.id;
		this.token = interaction.token;
	}

	public acknowledge(ephemeral = false) {
		this.isAcknowledged = true;
		this.client.post(`/interactions/${this.id}/${this.token}/callback`, {
			type: InteractionCallbackType.DeferredChannelMessageWithSource,
			data: {
				flags: ephemeral ? MessageFlags.Ephemeral : 0,
			},
		});
	}

	public reply(text: string, ephemeral = false) {
		if (this.isAcknowledged) {
			this.client.post(`/webhooks/${this.client.appId}/${this.token}`, {
				content: text,
			});
		} else {
			this.client.post(`/interactions/${this.id}/${this.token}/callback`, {
				type: InteractionCallbackType.ChannelMessageWithSource,
				data: {
					content: text,
					flags: ephemeral ? MessageFlags.Ephemeral : 0,
				},
			});
		}
	}
}
