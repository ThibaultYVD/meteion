const { _eventService } = require('@services');
const { _errorService } = require('@services/ErrorService');

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
			await interaction.deferUpdate();

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
		}
		catch (error) {
			await _errorService.reply(interaction, error);
		}
	},
};
