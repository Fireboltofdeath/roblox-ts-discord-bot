import { DiscordBot } from "./discord/discordBot";
import type { Message } from "./discord/types/message";
import { ApplicationCommandType } from "./discord/types/interaction";
import botConfig from "./bot.json";
import type { UpdatePresence } from "discord/types/updatePresence";
import { Status } from "discord/types/status";
import { ActivityType } from "discord/types/activity";

const UPDATE_COMMANDS = true;

const bot = new DiscordBot(botConfig.token, botConfig.appId);
const interactions = bot.interactions();

interactions.registerCommand({
	name: "repeat",
	type: ApplicationCommandType.ChatInput,
	description: "A random test command, managed entirely from Roblox!",
	integration_types: [1],
	contexts: [0, 1, 2],
	options: [
		{
			name: "message",
			description: "The message for me to repeat.",
			type: 3,
			required: true,
		},
	],
});

interactions.registerCommand({
	name: "messagetest",
	type: ApplicationCommandType.Message,
	integration_types: [1],
	contexts: [0, 1, 2],
});

interactions.registerCommand({
	name: "usertest",
	type: ApplicationCommandType.User,
	integration_types: [1],
	contexts: [0, 1, 2],
});

if (UPDATE_COMMANDS) {
	interactions.overwriteCommands();
	print("Commands updated!");
}

function createPresence(text: string): UpdatePresence {
	return {
		status: Status.DoNotDisturb,
		since: os.time(),
		afk: false,
		activities: [
			{
				name: text,
				created_at: os.time(),
				type: ActivityType.Game,
			},
		],
	};
}

bot.start();
bot.setPresence(createPresence("This place is unfamiliar."));

task.delay(15, () => {
	bot.setPresence(createPresence("I've been here forever."));
});

bot.connectDispatch("READY", (ready) => {
	print("Ready!", ready.user.username, `(${ready.guilds.size()} guilds)`);
});

bot.connectDispatch("INTERACTION_CREATE", (interaction) => {
	if (!interaction.data) {
		return;
	}

	const response = interactions.createInteractionResponse(interaction);

	if (interaction.data.name === "repeat") {
		const option = interaction.data!.options![0].value as string;
		response.acknowledge();
		task.wait(1);
		response.reply(option);
	} else if (interaction.data.name === "messagetest") {
		assert(interaction.data.target_id !== undefined);

		const message = interaction.data.resolved?.messages?.get(interaction.data.target_id);
		if (message) {
			response.reply(`"${message.content}"? what a weird thing to say..`);
		}
	} else if (interaction.data.name === "usertest") {
		assert(interaction.data.target_id !== undefined);

		const user = interaction.data.resolved?.users?.get(interaction.data.target_id);
		if (user) {
			response.reply(`"${user.username}"? what a weird name..`);
		}
	} else {
		response.reply("Unknown interaction");
	}
});

const knownMessages = new Map<string, Message>();

bot.connectDispatch("MESSAGE_CREATE", (message) => {
	if (message.content.lower() === "hello friends") {
		bot.message(message.channel_id, "hello. it's me.");
	}

	knownMessages.set(message.id, message);
});

bot.connectDispatch("MESSAGE_UPDATE", (message) => {
	const original = knownMessages.get(message.id);
	if (original) {
		if (message.content !== undefined && message.content !== original.content) {
			bot.message(
				message.channel_id,
				`I saw that, ${original.author.username}. I know you said "${original.content}"`,
			);

			original.content = message.content;
		}
	}
});

bot.connectDispatch("MESSAGE_DELETE", (message) => {
	const original = knownMessages.get(message.id);
	if (original) {
		bot.message(message.channel_id, `I saw what you deleted, ${original.author.username}!`);
	}
});

game.BindToClose(() => {
	bot.stop();
});
