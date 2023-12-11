const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js")
const { formatEventDateHeureValue } = require("./event")

function createEventEmbed(client, interaction, titre, description, date, heure) {
    console.log(interaction)
    let embed = new EmbedBuilder()
        .setColor(client.color)
        .setTitle(`Event : ${titre}`)
        .setDescription(`${description}`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: false }))
        .addFields(
            { name: 'Date et heure', value: formatEventDateHeureValue(date, heure) },
        )
        .addFields(
            { name: '\u200B', value: '\u200B' },
            { name: '✅ Participants', value: '\u200B', inline: true },
            { name: '❓Indécis', value: '\u200B', inline: true },
            { name: '🪑 Réservistes', value: '\u200B', inline: true },
        )
        .setImage('https://i.stack.imgur.com/Fzh0w.png')
        .setFooter({
            text: `Proposé par : ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: false }),
        })

    return embed

}

function getEventEmbedRows() {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('participant')
                .setLabel('Participant')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('indecis')
                .setLabel('Indécis')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('reserviste')
                .setLabel('Réserviste')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('eventRetreat')
                .setLabel('Se retirer')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('eventAdminPanel')
                .setLabel('Administration')
                .setStyle(ButtonStyle.Danger),
        );

    []

    return row
}


/**
 * Obtient l'embed pour le panel d'admin'.
 * @returns {embed}.
 */
function getAdminPanelEmbed(client, title, description, date, heure) {
    const AdminPanel = new EmbedBuilder()
        .setColor(client.color)
        .setTitle("Administration")
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'Titre : ', value: `${title}` },
            { name: 'Description : ', value: `${description}` },
            { name: 'Date : ', value: `${date}`, inline: true },
            { name: 'Heure : ', value: `${heure}`, inline: true },
        )
        .setImage('https://i.stack.imgur.com/Fzh0w.png')
        .setFooter({
            text: `Panel d'administration - ${client.user.username}`,
            iconURL: client.user.displayAvatarURL({ dynamic: false })
        });

    return AdminPanel
}

function getAdminPanelRows() {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('eventEdit')
                .setLabel(`Modifier l'événement`)
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('eventDelete')
                .setLabel(`Annuler l'événement`)
                .setStyle(ButtonStyle.Danger),
        );

    return row
}


/**
 * Obtient l'embed pour afficher des erreurs'.
 * @returns {embed}.
 */
function getErrorEmbed(error) {
    return errEmbed = new EmbedBuilder()
        .setTitle("New Error")
        .setColor("#FF0000")
        .setDescription("An error just occured!**\n\nERROR:\n\n** ```" + error + "```")
        .setTimestamp()
        .setFooter("Anti-Crash System")
}

module.exports = { createEventEmbed, getEventEmbedRows, getAdminPanelEmbed, getAdminPanelRows, getErrorEmbed }