const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

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

module.exports = {
	getEventDeleteModal,
};