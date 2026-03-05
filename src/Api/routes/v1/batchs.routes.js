const { _batchService } = require('@services');

module.exports = async function batchRoutes(app, opts) {
	const { context } = opts;
	const { client } = context;

	app.get('/', async () => {
		return { ok: true, message: 'Hello depuis /v1/batchs' };
	});

	app.post('/sendReminderMessage', async () => {
		return await _batchService.sendReminderMessages(client);
	});

	app.patch('/manageEventStarts', async () => {
		return await _batchService.manageEventStarts(client);
	});

	app.patch('/manageEventEnds', async () => {
		return await _batchService.manageEventEnds(client);
	});

	app.delete('/archiveEvents', async () => {
		return await _batchService.archiveEvents(client);
	});
};
