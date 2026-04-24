const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { _dateTimeService } = require('@services');

function getEventCreationModal(prefillData = null) {
	const isDev = process.env.APP_ENV === 'local';

	const modal = new ModalBuilder()
		.setCustomId('eventCreationModal')
		.setTitle('Création d\'un événement.');

	const currentDate = _dateTimeService.getCurrentDate();
	const currentHour = _dateTimeService.getCurrentHour();

	const eventTitleInput = new TextInputBuilder()
		.setCustomId('eventTitle')
		.setLabel('Titre.')
		.setStyle(TextInputStyle.Short)
		.setMaxLength(100)
		.setRequired(true);

	if (prefillData?.title) eventTitleInput.setValue(prefillData.title);
	else if (isDev) eventTitleInput.setValue('Exemple titre');

	const eventDescInput = new TextInputBuilder()
		.setCustomId('eventDesc')
		.setLabel('Description et/ou détails.')
		.setMaxLength(400)
		.setRequired(false)
		.setStyle(TextInputStyle.Paragraph);

	if (prefillData?.description) eventDescInput.setValue(prefillData.description);
	else if (isDev) eventDescInput.setValue('Exemple description');

	const dateInput = new TextInputBuilder()
		.setCustomId('eventDate')
		.setLabel('Date de l\'événement.')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder(currentDate)
		.setMaxLength(10)
		.setRequired(true);

	if (prefillData?.date) dateInput.setValue(prefillData.date);
	else if (isDev) dateInput.setValue(currentDate);

	const hourInput = new TextInputBuilder()
		.setCustomId('eventHour')
		.setLabel('Heure de l\'événement.')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder(currentHour)
		.setMaxLength(5)
		.setRequired(true);

	if (prefillData?.hour) hourInput.setValue(prefillData.hour);
	else if (isDev) hourInput.setValue(currentHour);

	const eventPlaceInput = new TextInputBuilder()
		.setCustomId('eventPlace')
		.setLabel('Lieu de rassemblement')
		.setMaxLength(100)
		.setStyle(TextInputStyle.Short)
		.setRequired(false);

	if (prefillData?.place) eventPlaceInput.setValue(prefillData.place);
	else if (isDev) eventPlaceInput.setValue('Exemple Lieu de rassemblement');

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
	getEventCreationModal,
};
