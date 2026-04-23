const { Events } = require('discord.js');
const createEventManagerJob = require('../jobs/eventManager');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		try {
			const eventManagerJob = createEventManagerJob(client);
			eventManagerJob.start();

			if (!eventManagerJob.isActive) return console.error('Echec du démarrage, le job eventManager ne s\'est pas lancé correctement.');
			console.log(`\nReady! Logged in as ${client.user.tag}.`);
		}
		catch (error) {
			console.error('❌ Échec démarrage :', error);
		}
	},
};
