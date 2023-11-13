const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

/**
 * Obtient le modal pour supprimer l'event'.
 * @returns {modal}.
 */
function getEventDeleteModal() {
    const modal = new ModalBuilder()
        .setCustomId('DeleteEventModal')
        .setTitle(`⚠️Annuler un événement⚠️`);


    const eventTitleInput = new TextInputBuilder()
        .setCustomId('eventTitleDelete')
        .setLabel(`⚠️Entrez "ANNULER" pour annuler l'évent.⚠️`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Annuler')
        .setRequired(true);


    modal.addComponents(new ActionRowBuilder().addComponents(eventTitleInput));

    return modal
}

module.exports = { getEventDeleteModal }