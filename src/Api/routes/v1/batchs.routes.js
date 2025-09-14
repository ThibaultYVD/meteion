const { _eventService } = require('@services/EventService');

module.exports = async function batchRoutes(app, opts) {
	const { context } = opts;
	const { client } = context;

	app.get('/', async () => {
		return { ok: true, message: 'Hello depuis /v1/batchs' };
	});

	app.post('/sendReminderMessage', async () => {
		const events = _eventService.getEventsStartingInOneHour();
		// Fetch tout les events qui respecte toutes les conditions
		// Envoyer tout les messages
		return { events };
	});

	app.patch('/manageEventStarts', async () => {
		// Fetch tout les events qui respecte toutes les conditions
		// Modifier tout les messages
	});
	app.patch('/manageEventEnds', async () => {
		// Fetch tout les events qui respecte toutes les conditions
		// Modifier tout les messages
	});
	app.delete('/archiveEvents', async () => {
		//
	});
};
