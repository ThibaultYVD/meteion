const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

function getQuickeventEditModal(currentEvent, currentDate, currentHour) {
	const modal = new ModalBuilder()
		.setCustomId('quickeventEditModal')
		.setTitle('Modification d\'un événement.');

	const eventTitleInput = new TextInputBuilder()
		.setCustomId('eventTitle')
		.setLabel('Titre.')
		.setStyle(TextInputStyle.Short)
		.setMaxLength(100)
		.setRequired(true)
		.setValue(currentEvent.event_title);

	const dateInput = new TextInputBuilder()
		.setCustomId('eventDate')
		.setLabel('Date de l\'événement.')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder(currentDate)
		.setMaxLength(10)
		.setRequired(true)
		.setValue(currentEvent.event_date_string);

	const hourInput = new TextInputBuilder()
		.setCustomId('eventHour')
		.setLabel('Heure de l\'événement.')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder(currentHour)
		.setMaxLength(5)
		.setRequired(true)
		.setValue(currentEvent.event_hour_string);

	modal.addComponents(
		new ActionRowBuilder().addComponents(eventTitleInput),
		new ActionRowBuilder().addComponents(dateInput),
		new ActionRowBuilder().addComponents(hourInput),
	);
	return modal;
}

module.exports = {
	getQuickeventEditModal,
};
