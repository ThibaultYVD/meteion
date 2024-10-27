const { CronJob } = require('cron');
const db = require('../models/Models');
const { Op } = require('sequelize');

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
		const events = await db.Event.findAll({
			where: {
				event_status: { [Op.notIn]: ['archived', 'cancelled'] },
			},
		});

		console.log(events.length);
		if (events.length === 0) return;

		for (const event of events) {
			// INFO: Envoie d'un message de rappel
			if (event.event_status == 'planned' && event.event_date_hour_timestamp < Date.now() + 3600 && event.remember_message_id == null) {
				console.log('message de rappel une heure avant');
				const channel = client.channels.cache.get(event.channel_id);
				const messageSent = await channel.send(`## 📝 L'événement "${event.event_title}" commence <t:${event.event_date_hour_timestamp}:R> !\nMerci de prévenir en cas de retard ou d'absence !`);
				await db.Event.update(
					{ remember_message_id: messageSent.id },
					{
					  where: {
							event_id: event.event_id,
					  },
					},
				  );
			}
			// Marges de +/- 2 minutes pour vérifier le timestamp
			const timestampMargin = 2 * 60 * 1000;
			if (event.event_status == 'planned' && event.event_date_hour_timestamp > Date.now() + 60 && event.remember_message_id != null) {
				console.log('message de rappel event commencé');
				const channel = client.channels.cache.get(event.channel_id);
				const message = await channel.messages.fetch(event.remember_message_id);
				await message.edit(`## 📝 L'événement "${event.event_title}" a commencé <t:${event.event_date_hour_timestamp}:R> ! \nMerci de venir si vous n'êtes pas encore présent !`);
				await db.Event.update(
					{ event_status: 'ongoing' },
					{
					  where: {
							event_id: event.event_id,
					  },
					},
				);
			}
			const threeHours = 3 * 60 * 60 * 1000;

			if (event.event_status == 'ongoing' && event.event_date_hour_timestamp > Date.now() + 10800) {
				const channel = client.channels.cache.get(event.channel_id);
				const message = await channel.messages.fetch(event.remember_message_id);
				await message.edit(`## 📝 L'événement "${event.event_title}" s'est terminé <t:${event.event_date_hour_timestamp}:R> !`);
				await db.Event.update(
					{ event_status: 'finished' },
					{
					  where: {
							event_id: event.event_id,
					  },
					},
				);
			}
			// 3 jours en millisecondes
			const threeDays = 3 * 24 * 3600;

			if (event.event_status == 'finished' && event.event_date_hour_timestamp > Date.now() + threeDays) {
				console.log('archivage event 3jr après');
				const channel = client.channels.cache.get(event.channel_id);

				// TODO: Archiver l'event en supprimant l'event, le message de rappel et en modifiant le statut en archived
				await db.Event.update(
					{ event_status: 'archived' },
					{
						where: {
							event_id: event.event_id,
						},
					},
				);

				const eventMessage = await channel.messages.fetch(event.event_id);
				if (rememberMessage) {
					await eventMessage.delete();
				}
				const rememberMessage = await channel.messages.fetch(event.remember_message_id);
				if (rememberMessage) {
					await message.delete();
				}
			}


		}
	}
	catch (error) {
		console.error(error);
	}
}

