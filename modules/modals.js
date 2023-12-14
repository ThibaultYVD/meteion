const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

/**
 * Obtient le modal pour renseigner les infos de l'event'.
 * @returns {modal}.
 */
function getEventCreationModal() {
    const modal = new ModalBuilder()
        .setCustomId('eventCreationModal')
        .setTitle(`Création d'un événement.`);


    const eventTitleInput = new TextInputBuilder()
        .setCustomId('eventTitle')
        .setLabel("Titre.")
        .setStyle(TextInputStyle.Short)
        .setMaxLength(100)
        .setRequired(true)
        //.setValue('test')

    const eventDescInput = new TextInputBuilder()
        .setCustomId('eventDesc')
        .setLabel("Description et/ou détails.")
        .setMaxLength(400)
        .setStyle(TextInputStyle.Paragraph)
        //.setValue('test')

    const DateInput = new TextInputBuilder()
        .setCustomId('eventDate')
        .setLabel("Date de l'événement.")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('01/01/2000')
        .setMaxLength(10)
        .setRequired(true)
        //.setValue('15/11/2023')

    const HourInput = new TextInputBuilder()
        .setCustomId('eventHour')
        .setLabel("Heure de l'événement.")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('00h00')
        .setMaxLength(5)
        .setRequired(true);


    // Add inputs to the modal
    modal.addComponents(
        new ActionRowBuilder().addComponents(eventTitleInput),
        new ActionRowBuilder().addComponents(eventDescInput),
        new ActionRowBuilder().addComponents(DateInput),
        new ActionRowBuilder().addComponents(HourInput));

    return modal
}


/**
 * Obtient le modal pour modifier l'event'.
 * @returns {modal}.
 */
function getEventEditModal(title, description, date, heure) {
    const modal = new ModalBuilder()
        .setCustomId('eventEditModal')
        .setTitle(`Modification d'un événement.`);


    const eventEditTitleInput = new TextInputBuilder()
        .setCustomId('eventTitle')
        .setLabel("Titre.")
        .setStyle(TextInputStyle.Short)
        .setMaxLength(100)
        .setValue(title)
        .setRequired(true);

    const eventEditDescInput = new TextInputBuilder()
        .setCustomId('eventDesc')
        .setLabel("Description et/ou détails.")
        .setMaxLength(400)
        .setValue(description)
        .setStyle(TextInputStyle.Paragraph);

    const eventEditDateInput = new TextInputBuilder()
        .setCustomId('eventDate')
        .setLabel("Date de l'événement.")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('01/01/2000')
        .setMaxLength(10)
        .setValue(date)
        .setRequired(true);

    const eventEditHourInput = new TextInputBuilder()
        .setCustomId('eventHour')
        .setLabel("Heure de l'événement.")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('00h00')
        .setMaxLength(5)
        .setValue(heure)
        .setRequired(true);

    // Add inputs to the modal
    modal.addComponents(
        new ActionRowBuilder().addComponents(eventEditTitleInput),
        new ActionRowBuilder().addComponents(eventEditDescInput),
        new ActionRowBuilder().addComponents(eventEditDateInput),
        new ActionRowBuilder().addComponents(eventEditHourInput));

    return modal
}



function getEventDeleteModal() {
    const modal = new ModalBuilder()
        .setCustomId('DeleteEventModal')
        .setTitle(`Annuler un événement`);


    const eventTitleInput = new TextInputBuilder()
        .setCustomId('eventTitleDelete')
        .setLabel(`⚠️Entrez "ANNULER" pour annuler l'évent.⚠️`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Annuler')
        .setRequired(true);


    modal.addComponents(new ActionRowBuilder().addComponents(eventTitleInput));

    return modal
}

module.exports = {getEventCreationModal, getEventEditModal, getEventDeleteModal}