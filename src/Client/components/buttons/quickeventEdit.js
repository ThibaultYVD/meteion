const { _eventRepository } = require('@repositories');
const { _dateTimeService } = require('@services');
const { getQuickeventEditModal } = require('@modals/builders/quickeventEditModalBuilder');
const { isCurrentUserIsAdmin } = require('@utils/helpers');

module.exports = {
	customId: 'quickeventEdit',
	async execute(interaction) {
		try {
			const currentEvent = await _eventRepository.findById(interaction.message.id);

			if (!currentEvent) {
				await interaction.reply({ content: 'Événement introuvable.', ephemeral: true });
				return;
			}

			if (!isCurrentUserIsAdmin(interaction.user.id, currentEvent.user_id)) {
				await interaction.reply({ content: 'Vous n\'avez pas les droits sur cet événement.', ephemeral: true });
				return;
			}

			const modal = getQuickeventEditModal(
				currentEvent,
				_dateTimeService.getCurrentDate(),
				_dateTimeService.getCurrentHour(),
			);
			await interaction.showModal(modal);
		}
		catch (error) {
			console.error('Erreur lors de l\'affichage du modal :', error);

			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({ content: 'Impossible d\'afficher le formulaire de modification.', ephemeral: true });
			}
		}
	},
};
