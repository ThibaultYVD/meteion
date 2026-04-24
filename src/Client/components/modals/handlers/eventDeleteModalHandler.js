const { _eventService } = require('@services');
const { _errorService } = require('@services/ErrorService');

module.exports = {
	customId: 'eventDeleteModal',
	async execute(interaction) {
		try {
			const value = interaction.fields.getTextInputValue('eventTitleDelete');

			if (value.toLowerCase() !== 'annuler') {
				return interaction.reply({
					content: 'La validation a échouée. Merci d\'entrer "annuler" pour supprimer cet événement.',
					flags: 64,
				});
			}

			await interaction.deferUpdate();

			const eventId = interaction.message.id;
			const event = await _eventService.cancelEvent(eventId, interaction.guild);

			if (event.remember_message_id) {
				await interaction.channel.messages.delete(event.remember_message_id);
			}

			await interaction.channel.messages.delete(eventId);
		}
		catch (error) {
			await _errorService.reply(interaction, error);
		}
	},
};