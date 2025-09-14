const { Events } = require('discord.js');
const { startServer } = require('@root/Api/index');
const createEventManagerJob = require('../jobs/eventManager');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		try {
			const app = await startServer({ client });
			const port = Number(process.env.HTTP_PORT || 3000);

			await app.listen({ port, host: '0.0.0.0' });
			client.http = app;
			const eventManagerJob = createEventManagerJob(client);
			eventManagerJob.start();

			if (!eventManagerJob.running) return console.error('Echec du démarrage, le job eventManager ne s\'est pas lancé correctement.');
			console.log(`🌐 API écoute sur http://localhost:${port}`);
			console.log(`\nReady! Logged in as ${client.user.tag} on port ${port}.`);
		}
		catch (error) {
			console.error('❌ Échec démarrage :', error);
		}

	},
};
