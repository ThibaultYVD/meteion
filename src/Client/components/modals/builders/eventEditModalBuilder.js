const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

function getEventEditModal(currentEvent, currentDate, currentHour) {
	const modal = new ModalBuilder()
		.setCustomId('eventEditModal')
		.setTitle('Modification d\'un événement.');

	const eventTitleInput = new TextInputBuilder()
		.setCustomId('eventTitle')
		.setLabel('Titre.')
		.setStyle(TextInputStyle.Short)
		.setMaxLength(100)
		.setRequired(true)
		.setValue(currentEvent.event_title);

	const eventDescInput = new TextInputBuilder()
		.setCustomId('eventDesc')
		.setLabel('Description et/ou détails.')
		.setMaxLength(400)
		.setRequired(false)
		.setStyle(TextInputStyle.Paragraph)
		.setValue(currentEvent.event_description);

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

	const eventPlaceInput = new TextInputBuilder()
		.setCustomId('eventPlace')
		.setLabel('Lieu de rassemblement')
		.setMaxLength(100)
		.setStyle(TextInputStyle.Short)
		.setRequired(false)
		.setValue(currentEvent.event_place);

	modal.addComponents(
		new ActionRowBuilder().addComponents(eventTitleInput),
		new ActionRowBuilder().addComponents(eventDescInput),
		new ActionRowBuilder().addComponents(dateInput),
		new ActionRowBuilder().addComponents(hourInput),
		new ActionRowBuilder().addComponents(eventPlaceInput),
	);
	return modal;
}

module.exports = {
	getEventEditModal,
};