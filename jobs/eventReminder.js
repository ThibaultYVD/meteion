const { CronJob } = require('cron');
const db = require('../../models/Models');

module.exports = (client) => {
	const job = new CronJob(
		'0 * * * * *',
		() => eventReminder(client),
		null,
		false,
		'Europe/Paris',
	);
	return job;
};

async function eventReminder(client) {
	try {
		const events = await db.Event.find({ event_status: { $nin: ['archived', 'cancelled'] } });

		if (events.length === 0) return;

		for (const event of events) {
			// INFO: Envoie d'un message de rappel
			if (event.event_status == 'planned' && event.event_date_hour_timestamp < Date.now() + 3600 && event.remember_message_id == null) {
				const channel = client.channels.cache.get(event.channel_id);
				const messageSent = await channel.send(`## 📝 L'événement "${event.event_title}" commence <t:${event.epoch_timestamp}:R> !\nMerci de prévenir en cas de retard ou d'absence !`);
			}
			if (event.event_status == 'planned' && event.event_date_hour_timestamp < Date.now() && event.remember_message_id != null) {
				const channel = client.channels.cache.get(event.channel_id);
				client.db.query(`UPDATE events SET rappel_message_id='${messageSent.id}' WHERE event_id = '${event.event_id}'`);
				// TODO: Edit le message de rappel quand l'évent commence réellement
			}
			if (event.event_status == 'ongoing' && event.event_date_hour_timestamp > Date.now()) {
				const channel = client.channels.cache.get(event.channel_id);
				// TODO: Edit le message de rappel et modifier le statut en finished 3h après le début de l'event
			}
			if (event.event_status == 'finished' && event.event_date_hour_timestamp > Date.now()) {
				const channel = client.channels.cache.get(event.channel_id);
				// TODO: Archiver l'event en supprimant l'event, le message de rappel et en modifiant le statut en archived 3jours après le début de l'event
			}

		}
	}
	catch (error) {
		console.error(error);
	}
}

