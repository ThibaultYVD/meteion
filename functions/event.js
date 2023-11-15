const Discord = require("discord.js")
const { getErrorEmbed } = require("../functions/error")
const { formatEventDate, formatEventHour } = require("../functions/date")
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

/**
 * Obtient le modal pour renseigner les infos de l'event'.
 * @returns {modal}.
 */
function createEventModal() {
    const modal = new ModalBuilder()
        .setCustomId('eventCreationModal')
        .setTitle(`Création d'un événement.`);


    const eventTitleInput = new TextInputBuilder()
        .setCustomId('eventTitle')
        .setLabel("Titre.")
        .setStyle(TextInputStyle.Short)
        .setMaxLength(100)
        .setRequired(true)
        .setValue('test')

    const eventDescInput = new TextInputBuilder()
        .setCustomId('eventDesc')
        .setLabel("Description et/ou détails.")
        .setMaxLength(400)
        .setStyle(TextInputStyle.Paragraph)
        .setValue('test')

    const DateInput = new TextInputBuilder()
        .setCustomId('eventDate')
        .setLabel("Date de l'événement.")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('01/01/2000')
        .setMaxLength(10)
        .setRequired(true)
        .setValue('15/11/2023')

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

function createEventEmbed(SoraBot, interaction, titre, description, date, heure) {
    let embed = new Discord.EmbedBuilder()
        .setColor(SoraBot.color)
        .setTitle(`Event : ${titre}`)
        .setDescription(`${description}`)
        .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: false }))
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
    const row = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId('participant')
                .setLabel('Participant')
                .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
                .setCustomId('indecis')
                .setLabel('Indécis')
                .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
                .setCustomId('reserviste')
                .setLabel('Réserviste')
                .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
                .setCustomId('eventRetreat')
                .setLabel('Se retirer')
                .setStyle(Discord.ButtonStyle.Danger),
            new Discord.ButtonBuilder()
                .setCustomId('eventAdminPanel')
                .setLabel('Administration')
                .setStyle(Discord.ButtonStyle.Danger),
        );

    []

    return row
}

/**
 * Met à jour le choix de l'utilisateur en mettant à jour dans la BDD puis redessine l'embed'.
 * @returns {modal}.
 */
function updateChoice(SoraBot, interaction, username, choice) {
    try {
        SoraBot.db.query(`UPDATE guild_members SET user_tag = '${interaction.user.tag}', nickname = '${username}' WHERE user_id = '${interaction.user.id}'`)

        if (choice == "Se retirer") {

            SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction.user.id}'`, async (err, all) => {


                if (!all.length < 1) {

                    SoraBot.db.query(`DELETE FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction.user.id}'`)

                    SoraBot.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${interaction.message.id}'`, (err, req) => {

                        const participants = [];
                        const indecis = [];
                        const reservistes = [];
                        for (let i = 0; i < req.length; i++) {
                            switch (req[i].choice_name) {
                                case 'Participant':
                                    participants.push(req[i].guild_nickname)
                                    break;
                                case 'Indécis':
                                    indecis.push(req[i].guild_nickname)
                                    break;
                                case 'Réserviste':
                                    reservistes.push(req[i].guild_nickname)
                                    break;
                                default:
                                    break;
                            }
                        }

                        // Met à jour l'embed
                        let embed = redrawEmbed(SoraBot, interaction.message.embeds[0].title, interaction.message.embeds[0].description, interaction.message.embeds[0].fields[0].value, participants, indecis, reservistes, interaction.message.embeds[0].footer);
                        interaction.message.edit({ embeds: [embed] });
                        interaction.deferUpdate()


                    })

                } else {
                    interaction.deferUpdate()
                }
            })
        } else {
            // Mise à jour de l'utilisateur dans la base de données
            SoraBot.db.query(`UPDATE members_event_choice SET choice_name = '${choice}', guild_nickname='${username}' WHERE user_id = '${interaction.user.id}' AND event_id = '${interaction.message.id}'`);

            // Vérifie si l'utilisateur a déjà fait un choix pour cet événement
            SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction.user.id}'`, async (err, all) => {
                if (all.length < 1) {
                    // Si l'utilisateur n'a pas encore fait de choix, l'ajoute à la base de données
                    await SoraBot.db.query(`INSERT INTO members_event_choice (user_id, guild_nickname, choice_name, event_id) VALUES ('${interaction.user.id}','${username}','${choice}','${interaction.message.id}')`);
                } else {
                    // Si l'utilisateur a déjà fait un choix, met à jour son choix
                    await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = '${choice}', guild_nickname='${username}' WHERE user_id = '${interaction.user.id}' AND event_id = '${interaction.message.id}'`);
                }

                // Met à jour les listes de participants, d'indécis et de réservistes
                SoraBot.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${interaction.message.id}'`, (err, req) => {
                    const participants = [];
                    const indecis = [];
                    const reservistes = [];

                    for (let i = 0; i < req.length; i++) {
                        switch (req[i].choice_name) {
                            case 'Participant':
                                participants.push(req[i].guild_nickname);
                                break;
                            case 'Indécis':
                                indecis.push(req[i].guild_nickname);
                                break;
                            case 'Réserviste':
                                reservistes.push(req[i].guild_nickname);
                                break;
                        }
                    }

                    // Met à jour l'embed
                    let embed = redrawEmbed(SoraBot, interaction.message.embeds[0].title, interaction.message.embeds[0].description, interaction.message.embeds[0].fields[0].value, participants, indecis, reservistes, interaction.message.embeds[0].footer);
                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate()
                });
            });
        }

    } catch (err) {
        console.log(err)
        message.reply({ embeds: [getErrorEmbed(error)] })
    }

}

/**
 * Formatte la liste des personnes inscrites'.
 * @returns {String} formatté.
 */
function formatList(list) {
    if (list.length === 0) {
        return '\u200B'; // Renvoie un espace sans largeur pour une liste vide
    } else {
        // Si la liste n'est pas vide, formate les éléments
        const formattedList = list.map(item => `- ${item}\n`);
        return formattedList.join(''); // Fusionne les éléments formatés en une seule chaîne
    }
}

/**
 * Actualise l'embed d'event.
 * @returns {Embed} d'un event.
 */
function redrawEmbed(SoraBot, title, description, dateheure, participants, indecis, reservistes, footer) {
    const formattedParticipants = formatList(participants);
    const formattedIndecis = formatList(indecis);
    const formattedReservistes = formatList(reservistes);
    const embed = new Discord.EmbedBuilder()
        .setColor(SoraBot.color)
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'Date et heure', value: dateheure },
            { name: '\u200B', value: '\u200B' },
            { name: '✅ Participants', value: formattedParticipants, inline: true },
            { name: '❓Indécis', value: formattedIndecis, inline: true },
            { name: '🪑 Réservistes', value: formattedReservistes, inline: true },
        )
        .setImage('https://i.stack.imgur.com/Fzh0w.png')
        .setFooter(footer);

    return embed;
}

function formatEventDateHeureValue(date, heure) {

    const epoch_timestamp = Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`)

    let epoch_timestamp1 = epoch_timestamp.toString()
    let correct_epoch_timestamp = epoch_timestamp1.substring(0, epoch_timestamp1.length - 3)

    return `Le <t:${correct_epoch_timestamp}:d> à <t:${correct_epoch_timestamp}:t> (<t:${correct_epoch_timestamp}:R>)`

}


async function sendMessage(SoraBot, interaction, message, channel, event_title, eventId) {
    const messageSent = await channel.send(`## 📝 L'événement "${event_title}" commence dans une heure !\nMerci de prévenir en cas de retard ou d'absence !`);

    SoraBot.db.query(`UPDATE events 
    SET rappelMessageId='${messageSent.id}' WHERE event_id = '${eventId}'`)


}

module.exports = { createEventModal, updateChoice, redrawEmbed, formatEventDateHeureValue, createEventEmbed, getEventEmbedRows, sendMessage }