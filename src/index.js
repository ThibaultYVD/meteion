require('module-alias/register');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const i18next = require('./locales/config/i18n');
const { startServer } = require('@api/index');

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildScheduledEvents,
	],
});

client.color = '#684AF0';
client.commands = new Collection();
client.i18next = i18next;

const foldersPath = path.join(__dirname, 'Client', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const db = require('@models');

db.sequelize.sync({ alter: process.env.APP_ENV === 'local' });

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

const eventsPath = path.join(__dirname, 'Client', 'events');
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

(async () => {
	const app = await startServer({ client });
	const port = Number(process.env.HTTP_PORT || 3000);
	await app.listen({ port, host: '0.0.0.0' });
	client.http = app;
	console.log(`🌐 API écoute sur http://localhost:${port}`);

	await client.login(process.env.TOKEN);
})().catch(console.error);

// Handles errors and avoids crashes, better to not remove them.
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);
