const { getEventDeleteModal } = require('@modals/builders/eventDeleteModalBuilder');
const { _eventRepository } = require('@repositories');

module.exports = {
	customId: 'eventDelete',
	async execute(interaction) {
		try {
			const currentEvent = await _eventRepository.findById(interaction.message.id);

			const isAdmin = currentEvent.user_id === interaction.user.id || interaction.user.id === process.env.SUPERADMIN1;
			if (!isAdmin) return interaction.reply({ content: 'Vous n\'avez pas les droits sur cet événement.', ephemeral: true });

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