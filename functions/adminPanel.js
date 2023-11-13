const Discord = require("discord.js")

/**
 * Obtient l'embed pour le panel d'admin'.
 * @returns {embed}.
 */
function getAdminPanelEmbed(SoraBot, title, description, date, heure) {
    const AdminPanel = new Discord.EmbedBuilder()
        .setColor(SoraBot.color)
        .setTitle("Administration")
        .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'Titre : ', value: `${title}` },
            { name: 'Description : ', value: `${description}` },
            { name: 'Date : ', value: `${date}`, inline: true },
            { name: 'Heure : ', value: `${heure}`, inline: true },
        )
        .setImage('https://i.stack.imgur.com/Fzh0w.png')
        .setFooter({
            text: `Panel d'administration - ${SoraBot.user.username}`,
            iconURL: SoraBot.user.displayAvatarURL({ dynamic: false })
        });

    return AdminPanel
}

function getAdminPanelRows() {
    const row = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId('eventEdit')
                .setLabel(`Modifier l'événement`)
                .setStyle(Discord.ButtonStyle.Secondary),
            new Discord.ButtonBuilder()
                .setCustomId('eventDelete')
                .setLabel(`Annuler l'événement`)
                .setStyle(Discord.ButtonStyle.Danger),
        );

    return row
}

module.exports = { getAdminPanelEmbed, getAdminPanelRows }