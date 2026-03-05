const { _interactionService, _eventChoiceService } = require('@services');

/**
 * Crée un handler d'exécution pour un bouton de choix d'événement.
 * @param {string} choiceName - Le nom du choix en base ('Participant', 'Indécis', 'Réserviste', 'Absent').
 * @param {string} onMessage - Message affiché quand le choix est activé.
 * @param {string} offMessage - Message affiché quand le choix est retiré.
 * @returns {Function} La fonction execute du bouton.
 */
function createChoiceButtonHandler(choiceName, onMessage, offMessage) {
	return async function execute(interaction) {
		const { user, member, guild, message } = interaction;
		try {
			await interaction.deferReply({ ephemeral: true });

			await _interactionService.handleUserAndGuildData({ guild, user, member });

			const isChosen = await _eventChoiceService.toggleUserChoice(message.id, user.id, choiceName);

			const choices = await _eventChoiceService.getChoicesForEmbed(message.id, guild.id);
			const embed = message.embeds[0];
			_eventChoiceService.updateEmbed(embed, choices);
			await interaction.message.edit({ embeds: [embed] });

			const content = isChosen ? onMessage : offMessage;
			await interaction.followUp({ content, ephemeral: true });

			setTimeout(async () => await interaction.deleteReply(), 2000);
		}
		catch (error) {
			console.error('Erreur lors du traitement du choix.', error);
			return await interaction.reply({
				content: 'Une erreur est survenue lors du traitement du choix.',
				ephemeral: true,
			});
		}
	};
}

module.exports = createChoiceButtonHandler;
