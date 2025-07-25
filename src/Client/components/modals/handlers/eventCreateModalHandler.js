const { _eventService } = require('@services');
const { createEventEmbed, getEventEmbedRows } = require('@embeds/eventEmbedBuilder');
const { errorService } = require('@services/ErrorService');

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
			const username = interaction.member.nickname || interaction.user.globalName;

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
			});

			const embed = createEventEmbed(client, interaction, username, title, description, place, epochTimestamp);
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
			});
		}
		catch (error) {
			await errorService.reply(interaction, client, error);
		}
	},
};
