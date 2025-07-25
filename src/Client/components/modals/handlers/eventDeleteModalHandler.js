const { _eventService } = require('@services');

module.exports = {
	customId: 'eventDeleteModal',
	async execute(interaction) {
		try {
			const value = interaction.fields.getTextInputValue('eventTitleDelete');

			if (value.toLowerCase() !== 'annuler') {
				return interaction.reply({
					content: 'La validation a échouée. Merci d\'entrer "annuler" pour supprimer cet événement.',
					ephemeral: true,
				});
			}

			const eventId = interaction.message.id;

			const event = await _eventService.cancelEvent(eventId, interaction.guild);

			// Supprime le message de rappel (s'il existe)
			if (event.remember_message_id) {
				await interaction.channel.messages.delete(event.remember_message_id);
			}

			// Supprime le message de l'événement
			await interaction.channel.messages.delete(eventId);
			await interaction.deferUpdate();
		}
		catch (error) {
			console.error(error);
		}
	},
};