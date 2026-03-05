const { _eventService } = require('@services');
const { errorService } = require('@services/ErrorService');

module.exports = {
	customId: 'eventEditModal',
	async execute(interaction) {
		const { fields, message, guild, client } = interaction;

		const title = fields.getTextInputValue('eventTitle');
		const description = fields.getTextInputValue('eventDesc');
		const date = fields.getTextInputValue('eventDate');
		const hour = fields.getTextInputValue('eventHour');
		const place = fields.getTextInputValue('eventPlace') || 'Non renseigné';

		try {
			await _eventService.updateEvent({
				message,
				guild,
				client,
				title,
				description,
				date,
				hour,
				place,
			});

			await interaction.deferUpdate();
		}
		catch (error) {
			await errorService.reply(interaction, client, error);
		}
	},
};
