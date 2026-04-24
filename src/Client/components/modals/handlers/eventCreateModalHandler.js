const crypto = require('node:crypto');
const { _eventService } = require('@services');
const { _eventImageRepository } = require('@repositories');
const { createEventEmbed, getEventEmbedRows } = require('@embeds/eventEmbedBuilder');
const { _errorService } = require('@services/ErrorService');
const pendingImages = require('@utils/pendingImages');
const pendingEventData = require('@utils/pendingEventData');

module.exports = {
	customId: 'eventCreationModal',
	async execute(interaction) {
		const client = interaction.client;

		try {
			const title = interaction.fields.getTextInputValue('eventTitle');
			const description = interaction.fields.getTextInputValue('eventDesc');
			const date = interaction.fields.getTextInputValue('eventDate');
			const hour = interaction.fields.getTextInputValue('eventHour');
			const place = interaction.fields.getTextInputValue('eventPlace') || client.i18next.t('event.info.bot.not_specified_location');

			pendingEventData.delete(interaction.user.id);
			const username = interaction.member.nickname || interaction.user.globalName;

			const pendingImage = pendingImages.get(interaction.user.id);
			pendingImages.delete(interaction.user.id);

			let imageId = null;
			let imageUrl = null;
			let imageBuffer = null;

			if (pendingImage) {
				const response = await fetch(pendingImage.url);
				imageBuffer = Buffer.from(await response.arrayBuffer());
				imageId = crypto.randomUUID();
				await _eventImageRepository.create({
					image_id: imageId,
					image_data: imageBuffer,
					image_name: pendingImage.name,
					image_type: pendingImage.contentType,
					created_at: new Date(),
				});
				imageUrl = `${process.env.IMAGE_BASE_URL}/v1/images/${imageId}`;
			}

			const {
				epochTimestamp,
				discordEventId,
				metadata,
			} = await _eventService.createEvent({
				interaction,
				title,
				description,
				date,
				hour,
				place,
				imageBuffer,
			});

			const embed = createEventEmbed(client, interaction, username, title, description, place, epochTimestamp, imageUrl);
			const rows = getEventEmbedRows(client);

			const reply = await interaction.reply({
				embeds: [embed],
				components: rows.map(r => r.toJSON()),
				fetchReply: true,
			});

			await _eventService.persistEvent({
				reply,
				interaction,
				metadata,
				epochTimestamp,
				discordEventId,
				imageId,
			});
		}
		catch (error) {
			pendingEventData.set(interaction.user.id, {
				title: interaction.fields.getTextInputValue('eventTitle'),
				description: interaction.fields.getTextInputValue('eventDesc'),
				date: interaction.fields.getTextInputValue('eventDate'),
				hour: interaction.fields.getTextInputValue('eventHour'),
				place: interaction.fields.getTextInputValue('eventPlace'),
			});
			await _errorService.reply(interaction, error);
		}
	},
};
