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
		const events = await fetchActiveEvents();
		if (events.length === 0) return;

		for (const event of events) {
			const channel = client.channels.cache.get(event.channel_id);
			await handleEvent(client, event, channel);
		}
	}
	catch (error) {
		console.error(`Erreur dans le gestionnaire d'événements: ${error}`);
	}
}

// Fetch events that are not archived or cancelled
async function fetchActiveEvents() {
	return db.sequelize.query(`
		SELECT DISTINCT e.*,
			COALESCE(MAX(CASE WHEN s.setting_name = 'event_reminder' THEN gs.activated END), 'TRUE') AS event_reminder,
			COALESCE(MAX(CASE WHEN s.setting_name = 'auto_close_event' THEN gs.activated END), 'TRUE') AS auto_close_event
		FROM events e
		LEFT JOIN guild_settings gs ON gs.guild_id = e.guild_id
		LEFT JOIN settings s ON s.setting_id = gs.setting_id
		WHERE e.event_status NOT IN ('archived', 'cancelled')
		GROUP BY e.event_id;
	`, {
		type: db.sequelize.QueryTypes.SELECT,
	});
}

// Handle all event conditions
async function handleEvent(client, event, channel) {
	const currentTimestamp = Math.floor(Date.now() / 1000);
	const eventTimeInMs = event.event_date_hour_timestamp * 1000;

	await sendReminderIfNeeded(event, channel, currentTimestamp);
	await startEventIfNeeded(event, channel, eventTimeInMs);
	await finishEventIfNeeded(event, channel, eventTimeInMs);
	await archiveEventIfNeeded(event, channel, eventTimeInMs);
}

// Reminder 1 hour before
async function sendReminderIfNeeded(event, channel, currentTimestamp) {
	if (
		event.event_status === 'planned' &&
		event.event_date_hour_timestamp - currentTimestamp <= 3600 &&
		event.event_date_hour_timestamp > currentTimestamp &&
		event.remember_message_id == null &&
		event.event_reminder === 'TRUE'
	) {
		try {
			const messageSent = await channel.send(
				`## 📝 L'événement "${event.event_title}" commence <t:${event.event_date_hour_timestamp}:R> !\nMerci de prévenir en cas de retard ou d'absence !`,
			);
			await db.Event.update(
				{ remember_message_id: messageSent.id },
				{ where: { event_id: event.event_id } },
			);
		}
		catch (err) {
			console.error(`Erreur lors de l'envoi du rappel: ${err}`);
		}
	}
}

// Start event if within 2-minute window
async function startEventIfNeeded(event, channel, eventTimeInMs) {
	const twoMinutes = 2 * 60 * 1000;
	const threeHours = 3 * 60 * 60 * 1000;
	if (
		event.event_status === 'planned' &&
		eventTimeInMs >= Date.now() - threeHours &&
		eventTimeInMs <= Date.now() + twoMinutes
	) {
		await db.Event.update(
			{ event_status: 'ongoing' },
			{ where: { event_id: event.event_id } },
		);

		if (event.remember_message_id && event.event_reminder === 'TRUE') {
			try {
				const message = await channel.messages.fetch(event.remember_message_id);
				await message.edit(
					`## 📝 L'événement "${event.event_title}" a commencé <t:${event.event_date_hour_timestamp}:R> ! \nMerci de venir si vous n'êtes pas encore présent !`,
				);
			}
			catch (err) {
				console.error(`Erreur lors de l'édition du message: ${err}`);
			}
		}
	}
}

// Finish event if it has been ongoing for 3 hours
async function finishEventIfNeeded(event, channel, eventTimeInMs) {
	const threeHours = 3 * 60 * 60 * 1000;
	if (event.event_status === 'ongoing' && Date.now() >= eventTimeInMs + threeHours) {
		await db.Event.update(
			{ event_status: 'finished' },
			{ where: { event_id: event.event_id } },
		);

		if (event.remember_message_id && event.event_reminder === 'TRUE') {
			try {
				const message = await channel.messages.fetch(event.remember_message_id);
				await message.edit(`## 📝 L'événement "${event.event_title}" s'est terminé <t:${event.event_date_hour_timestamp}:R> !`);
			}
			catch (err) {
				console.error(`Erreur lors de l'édition du message de fin: ${err}`);
			}
		}
	}
}

// Archive event if it has been finished for 3 days
async function archiveEventIfNeeded(event, channel, eventTimeInMs) {
	const threeDaysInMs = 3 * 24 * 3600 * 1000;
	if (Date.now() >= eventTimeInMs + threeDaysInMs) {
		await db.Event.update(
			{ event_status: 'archived' },
			{ where: { event_id: event.event_id } },
		);

		if (event.auto_close_event === 'TRUE') {
			try {
				if (await channel.messages.fetch(event.event_id).catch(() => null)) {
					await channel.messages.delete(event.event_id);
				}

				if (event.remember_message_id) {
					const rememberMessage = await channel.messages.fetch(event.remember_message_id).catch(() => null);
					if (rememberMessage) await rememberMessage.delete();
				}
			}
			catch (err) {
				console.error(`Erreur lors de la suppression des messages: ${err}`);
			}
		}
	}
}
