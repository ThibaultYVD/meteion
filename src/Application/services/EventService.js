class EventService {
	constructor(eventRepository, dateTimeService) {
		this.eventRepository = eventRepository;
		this.dateTimeService = dateTimeService;
	}

	async createEvent({ interaction, title, description, date, hour, place }) {
		const { client, guild, member, user } = interaction;
		const username = member.nickname || user.globalName;

		if (!this.dateTimeService.isValidDateTime(date, hour)) {
			throw new Error('INVALID_DATE_FORMAT');
		}

		const startTime = new Date(`${this.dateTimeService.formatEventDate(date)} ${this.dateTimeService.formatEventHour(hour)}:00`);
		if (isNaN(startTime.getTime())) {
			throw new Error('INVALID_DATE_PARSE');
		}

		const now = new Date();
		if (startTime <= now) {
			throw new Error('DATE_IN_PAST');
		}

		const epochTimestamp = Math.floor(startTime.getTime() / 1000);

		const nativeDiscordEventDescription = client.i18next.t('event.info.native_discord.description', { description });
		const scheduledStartTime = new Date(startTime);
		const scheduledEndTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);

		const discordEvent = await guild.scheduledEvents.create({
			name: title,
			scheduledStartTime,
			scheduledEndTime,
			privacyLevel: 2,
			entityType: 3,
			description: nativeDiscordEventDescription,
			entityMetadata: { location: place },
		});

		return {
			epochTimestamp,
			discordEventId: discordEvent.id,
			metadata: {
				title,
				description,
				date,
				hour,
				place,
				username,
			},
		};
	}

	async persistEvent({ reply, interaction, metadata, epochTimestamp, discordEventId }) {
		const { title, description, date, hour, place } = metadata;

		await this.eventRepository.create({
			event_id: reply.id,
			guild_id: reply.guildId,
			channel_id: reply.channelId,
			user_id: interaction.user.id,
			event_title: title,
			event_description: description,
			event_date_string: date,
			event_hour_string: hour,
			event_date_hour_timestamp: epochTimestamp.toString(),
			event_status: 'planned',
			event_place: place,
			created_at: new Date(),
			discord_event_id: discordEventId,
		});
	}


	async updateEvent({ message, guild, client, title, description, date, hour, place }) {
		if (!this.dateTimeService.isValidDateTime(date, hour)) {
			throw new Error('INVALID_DATE_FORMAT');
		}

		const startTime = new Date(`${this.dateTimeService.formatEventDate(date)} ${this.dateTimeService.formatEventHour(hour)}:00`);
		if (isNaN(startTime.getTime())) {
			throw new Error('INVALID_DATE_PARSE');
		}

		const now = new Date();
		if (startTime <= now) {
			throw new Error('DATE_IN_PAST');
		}

		const epochTimestamp = Math.floor(startTime.getTime() / 1000);

		// Update embed
		const originalEmbed = message.embeds[0];
		const embed = new (require('discord.js').EmbedBuilder)(originalEmbed.data)
			.setTitle(title)
			.setDescription(description);

		const dateFieldIndex = embed.data.fields.findIndex(f => f.name.includes('Temps'));
		if (dateFieldIndex !== -1) {
			embed.data.fields[dateFieldIndex].value = `<t:${epochTimestamp}:F>\n*<t:${epochTimestamp}:R>*`;
		}

		const placeFieldIndex = embed.data.fields.findIndex(f => f.name.includes('Lieu de rassemblement'));
		if (placeFieldIndex !== -1) {
			embed.data.fields[placeFieldIndex].value = `*${place}*`;
		}

		await message.edit({ embeds: [embed] });

		// Update DB
		await this.eventRepository.update(message.id, {
			event_title: title,
			event_description: description,
			event_date_string: date,
			event_hour_string: hour,
			event_date_hour_timestamp: epochTimestamp.toString(),
			event_place: place,
		});

		// Update Discord scheduled event
		const eventRecord = await this.eventRepository.findById(message.id);
		if (eventRecord?.discord_event_id) {
			const scheduledEvent = await guild.scheduledEvents.fetch(eventRecord.discord_event_id).catch(() => null);
			if (scheduledEvent) {
				await scheduledEvent.edit({
					name: title,
					description: client.i18next.t('event.info.native_discord.description', { description }),
					scheduledStartTime: new Date(epochTimestamp * 1000),
					scheduledEndTime: new Date(startTime.getTime() + 3 * 60 * 60 * 1000),
					entityMetadata: { location: place },
				}).catch(err => console.error('Erreur update event discord:', err));
			}
		}
	}


	async cancelEvent(eventId, guild) {
		const currentEvent = await this.eventRepository.findById(eventId);
		if (!currentEvent) throw new Error('Event not found');

		const discordEvent = await guild.scheduledEvents.fetch(currentEvent.discord_event_id).catch(() => null);
		if (discordEvent) {
			await discordEvent.delete().catch(() => null);
		}

		await this.eventRepository.update(eventId, { event_status: 'cancelled' });

		return currentEvent;
	}
}

module.exports = EventService;
