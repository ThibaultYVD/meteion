const { CronJob } = require('cron');
const { _batchService } = require('@services');

module.exports = (client) => {
	const job = new CronJob(
		'0 * * * * *',
		() => eventManager(client),
		null,
		false,
		'Europe/Paris',
	);
	return job;
};

async function eventManager(client) {
	try {
		await _batchService.sendReminderMessages(client);
		await _batchService.manageEventStarts(client);
		await _batchService.manageEventEnds(client);
		await _batchService.archiveEvents(client);
	}
	catch (error) {
		console.error(`Erreur dans le gestionnaire d'événements: ${error}`);
	}
}
