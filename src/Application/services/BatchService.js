const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class BatchService {
	constructor(eventRepository) {
		this.eventRepository = eventRepository;
	}

	async sendReminderMessages(client) {
		let processed = 0;
		try {
			const events = await this.eventRepository.findActiveEventsWithSettings();
			const currentTimestamp = Math.floor(Date.now() / 1000);

			for (const event of events) {
				if (
					event.event_status !== 'planned' ||
					event.event_date_hour_timestamp - currentTimestamp > 3600 ||
					event.event_date_hour_timestamp <= currentTimestamp ||
					event.remember_message_id !== null ||
					event.event_reminder !== 'TRUE'
				) continue;

				try {
					const channel = client.channels.cache.get(event.channel_id);
					const messageSent = await channel.send(
						`## 📝 L'événement "${event.event_title}" commence <t:${event.event_date_hour_timestamp}:R> !\nMerci de prévenir en cas de retard ou d'absence !`,
					);
					await this.eventRepository.update(event.event_id, { remember_message_id: messageSent.id });
					processed++;
				}
				catch (err) {
					console.error(`Erreur lors de l'envoi du rappel (event ${event.event_id}): ${err}`);
				}
			}
		}
		catch (error) {
			console.error(`Erreur dans sendReminderMessages: ${error}`);
		}
		return { processed };
	}

	async manageEventStarts(client) {
		let processed = 0;
		try {
			const events = await this.eventRepository.findActiveEventsWithSettings();
			const twoMinutes = 2 * 60 * 1000;
			const threeHours = 3 * 60 * 60 * 1000;

			for (const event of events) {
				const eventTimeInMs = event.event_date_hour_timestamp * 1000;
				if (
					event.event_status !== 'planned' ||
					eventTimeInMs < Date.now() - threeHours ||
					eventTimeInMs > Date.now() + twoMinutes
				) continue;

				try {
					await this.eventRepository.update(event.event_id, { event_status: 'ongoing' });
					processed++;

					if (event.remember_message_id && event.event_reminder === 'TRUE') {
						const channel = client.channels.cache.get(event.channel_id);
						const message = await channel.messages.fetch(event.remember_message_id);
						await message.edit(
							`## 📝 L'événement "${event.event_title}" a commencé <t:${event.event_date_hour_timestamp}:R> ! \nMerci de venir si vous n'êtes pas encore présent !`,
						);
					}
				}
				catch (err) {
					console.error(`Erreur lors du démarrage de l'événement (event ${event.event_id}): ${err}`);
				}
			}
		}
		catch (error) {
			console.error(`Erreur dans manageEventStarts: ${error}`);
		}
		return { processed };
	}

	async manageEventEnds(client) {
		let processed = 0;
		try {
			const events = await this.eventRepository.findActiveEventsWithSettings();
			const threeHours = 3 * 60 * 60 * 1000;

			for (const event of events) {
				const eventTimeInMs = event.event_date_hour_timestamp * 1000;
				if (event.event_status !== 'ongoing' || Date.now() < eventTimeInMs + threeHours) continue;

				try {
					const channel = client.channels.cache.get(event.channel_id);
					const event_message = await channel.messages.fetch(event.event_id);
					const row = new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('eventOver')
							.setLabel('L\'événement est terminé.')
							.setStyle(ButtonStyle.Secondary),
					);
					await event_message.edit({ components: [row] });
					await this.eventRepository.update(event.event_id, { event_status: 'finished' });
					processed++;

					if (event.remember_message_id && event.event_reminder === 'TRUE') {
						const message = await channel.messages.fetch(event.remember_message_id);
						await message.edit(`## 📝 L'événement "${event.event_title}" est terminé !`);
					}
				}
				catch (err) {
					console.error(`Erreur lors de la fin de l'événement (event ${event.event_id}): ${err}`);
				}
			}
		}
		catch (error) {
			console.error(`Erreur dans manageEventEnds: ${error}`);
		}
		return { processed };
	}

	async archiveEvents(client) {
		let processed = 0;
		try {
			const events = await this.eventRepository.findActiveEventsWithSettings();
			const threeDaysInMs = 3 * 24 * 3600 * 1000;

			for (const event of events) {
				const eventTimeInMs = event.event_date_hour_timestamp * 1000;
				if (Date.now() < eventTimeInMs + threeDaysInMs) continue;

				try {
					const channel = client.channels.cache.get(event.channel_id);
					await this.eventRepository.update(event.event_id, { event_status: 'archived' });
					processed++;

					if (event.remember_message_id) {
						const rememberMessage = await channel.messages.fetch(event.remember_message_id).catch(() => null);
						if (rememberMessage) await rememberMessage.delete();
					}

					if (event.auto_close_event === 'TRUE') {
						if (await channel.messages.fetch(event.event_id).catch(() => null)) {
							await channel.messages.delete(event.event_id);
						}
					}
				}
				catch (err) {
					console.error(`Erreur lors de l'archivage de l'événement (event ${event.event_id}): ${err}`);
				}
			}
		}
		catch (error) {
			console.error(`Erreur dans archiveEvents: ${error}`);
		}
		return { processed };
	}
}

module.exports = BatchService;
