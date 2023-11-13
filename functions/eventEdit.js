const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

/**
 * Obtient le modal pour modifier l'event'.
 * @returns {modal}.
 */
function getEventEditModal(title, description, date, heure) {
    const modalEdit = new ModalBuilder()
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
    modalEdit.addComponents(
        new ActionRowBuilder().addComponents(eventEditTitleInput),
        new ActionRowBuilder().addComponents(eventEditDescInput),
        new ActionRowBuilder().addComponents(eventEditDateInput),
        new ActionRowBuilder().addComponents(eventEditHourInput));

    return modalEdit
}

module.exports = { getEventEditModal }