const { Events } = require('discord.js');
const createEventManagerJob = require('../jobs/eventManager');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		try {
			const eventManagerJob = createEventManagerJob(client);
			eventManagerJob.start();

			if (!eventManagerJob.running) return console.error('Echec du démarrage, le job eventManager ne s\'est pas lancé correctement.');
			console.log(`\nReady! Logged in as ${client.user.tag}`);
		}
		catch (error) {

		}

	},
};