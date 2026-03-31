const { _eventService } = require('@services');
const { _eventRepository } = require('@repositories');
const { _errorService } = require('@services/ErrorService');

module.exports = {
	customId: 'quickeventEditModal',
	async execute(interaction) {
		const { fields, message, guild, client } = interaction;

		const title = fields.getTextInputValue('eventTitle');
		const date = fields.getTextInputValue('eventDate');
		const hour = fields.getTextInputValue('eventHour');

		try {
			const currentEvent = await _eventRepository.findById(message.id);

			await _eventService.updateEvent({
				message,
				guild,
				client,
				title,
				description: currentEvent.event_description,
				date,
				hour,
				place: currentEvent.event_place,
			});

			await interaction.deferUpdate();
		}
		catch (error) {
			await _errorService.reply(interaction, client, error);
		}
	},
};
