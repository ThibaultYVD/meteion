const { _eventRepository } = require('@repositories');
const { _dateTimeService } = require('@services');
const { getEventEditModal } = require('@modals/builders/eventEditModalBuilder');

module.exports = {
	customId: 'eventEdit',
	async execute(interaction) {
		try {
			const currentEvent = await _eventRepository.findById(interaction.message.id);

			if (!currentEvent) {
				if (!interaction.replied && !interaction.deferred) {
					await interaction.reply({
						content: 'Événement introuvable.',
						ephemeral: true,
					});
				}
				return;
			}

			const isAdmin =
				currentEvent.user_id === interaction.user.id ||
				interaction.user.id === process.env.SUPERADMIN1;

			if (!isAdmin) {
				if (!interaction.replied && !interaction.deferred) {
					await interaction.reply({
						content: 'Vous n\'avez pas les droits sur cet événement.',
						ephemeral: true,
					});
				}
				return;
			}

			const currentDate = _dateTimeService.getCurrentDate();
			const currentHour = _dateTimeService.getCurrentHour();

			// ATTENTION : showModal = réponse unique → ne jamais répondre après

			const modal = getEventEditModal(currentEvent, currentDate, currentHour);
			await interaction.showModal(modal);
		}
		catch (error) {
			console.error('Erreur lors de l\'affichage du modal :', error);

			// showModal a peut-être échoué → interaction toujours "ouverte"
			if (!interaction.replied && !interaction.deferred) {
				return await interaction.reply({
					content: 'Impossible d\'afficher le formulaire de modification.',
					ephemeral: true,
				});
			}
		}
	},
};
