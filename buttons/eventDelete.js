const db = require('../models/Models');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	customId: 'eventDelete',
	async execute(interaction) {
		try {
			const currentEvent = await db.Event.findByPk(interaction.message.id);

			const isAdmin = currentEvent.user_id === interaction.user.id || interaction.user.id === process.env.SUPERADMIN1;
			if (!isAdmin) return interaction.reply({ content: 'Vous n\'avez pas les droits sur cet événement.', ephemeral: true });

			await interaction.showModal(getEventDeleteModal());
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

function getEventDeleteModal() {
	const modal = new ModalBuilder()
		.setCustomId('eventDeleteModal')
		.setTitle('Annuler l\'événement.');

	const eventTitleInput = new TextInputBuilder()
		.setCustomId('eventTitleDelete')
		.setLabel('Entrez "Annuler" pour annuler l\'événement.')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('Annuler')
		.setRequired(true);

	modal.addComponents(new ActionRowBuilder().addComponents(eventTitleInput));

	return modal;
}
