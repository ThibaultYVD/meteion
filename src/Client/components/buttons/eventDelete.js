const { getEventDeleteModal } = require('@modals/builders/eventDeleteModalBuilder');
const { _eventRepository } = require('@repositories');
const { isCurrentUserIsAdmin } = require("@utils/helpers");

module.exports = {
	customId: 'eventDelete',
	async execute(interaction) {
		try {
			const currentEvent = await _eventRepository.findById(interaction.message.id);

			if (
				!isCurrentUserIsAdmin(interaction.user.id, currentEvent.user_id) &&
				!interaction.replied &&
				!interaction.deferred
			) {
				await interaction.reply({
					content: "Vous n'avez pas les droits sur cet événement.",
					ephemeral: true,
				});
				return;
			}
			const modal = getEventDeleteModal();
			await interaction.showModal(modal);
		}
		catch (error) {
			console.error('Erreur lors du traitement du bouton.', error);
			return await interaction.reply({
				content: 'Une erreur est survenue lors du traitement du bouton.',
				ephemeral: true,
			});
		}
	},
};