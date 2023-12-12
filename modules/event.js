const Discord = require("discord.js")
const { formatEventDate, formatEventHour } = require("../modules/date")
const { createInfoLog, createWarnLog, createErrorLog } = require("./logs")

/**
 * Met à jour le choix de l'utilisateur en mettant à jour dans la BDD puis redessine l'embed'.
 */
function updateChoice(client, interaction, username, choice) {
    client.db.query(`UPDATE guild_members SET user_tag = '${interaction.user.tag}', nickname = '${username}' WHERE user_id = '${interaction.user.id}'`)

    if (choice == "Se retirer") {
        try {
            client.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction.user.id}'`, async (err, all) => {


                if (!all.length < 1) {

                    client.db.query(`DELETE FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction.user.id}'`)

                    client.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${interaction.message.id}'`, (err, req) => {

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
                        let embed = redrawEmbed(client, interaction.message.embeds[0].title, interaction.message.embeds[0].description, interaction.message.embeds[0].fields[0].value, participants, indecis, reservistes, interaction.message.embeds[0].footer);
                        interaction.message.edit({ embeds: [embed] });
                        interaction.deferUpdate()


                    })

                } else {
                    interaction.deferUpdate()
                }
            })
        } catch (err) {
            createErrorLog(client, `La mise à jour du choix ${choice} dans l'event avec l'id ${interaction.message.id} a échoué.`, "modules/event.js", interaction.user.id)
        }
    } else {
        try {
            // Mise à jour de l'utilisateur dans la base de données
            client.db.query(`UPDATE members_event_choice SET choice_name = '${choice}', guild_nickname='${username}' WHERE user_id = '${interaction.user.id}' AND event_id = '${interaction.message.id}'`);

            // Vérifie si l'utilisateur a déjà fait un choix pour cet événement
            client.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction.user.id}'`, async (err, all) => {
                if (all.length < 1) {
                    // Si l'utilisateur n'a pas encore fait de choix, l'ajoute à la base de données
                    await client.db.query(`INSERT INTO members_event_choice (user_id, guild_nickname, choice_name, event_id) VALUES ('${interaction.user.id}','${username}','${choice}','${interaction.message.id}')`);
                } else {
                    // Si l'utilisateur a déjà fait un choix, met à jour son choix
                    await client.db.query(`UPDATE members_event_choice SET choice_name = '${choice}', guild_nickname='${username}' WHERE user_id = '${interaction.user.id}' AND event_id = '${interaction.message.id}'`);
                }

                // Met à jour les listes de participants, d'indécis et de réservistes
                client.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${interaction.message.id}'`, (err, req) => {
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
                    let embed = redrawEmbed(client, interaction.message.embeds[0].title, interaction.message.embeds[0].description, interaction.message.embeds[0].fields[0].value, participants, indecis, reservistes, interaction.message.embeds[0].footer);
                    interaction.message.edit({ embeds: [embed] });
                    interaction.deferUpdate()
                });
            });
        } catch (error) {
            createErrorLog(client, `La mise à jour du choix ${choice} dans l'event avec l'id ${interaction.message.id} a échoué.`, "modules/event.js", interaction.user.id)
        }
    }
}

/**
 * Formatte la liste des personnes inscrites'.
 * @returns {String} formatté.
 */
function formatList(list) {
    try {
        if (list.length === 0) {
            return '\u200B'; // Renvoie un espace sans largeur pour une liste vide
        } else {
            // Si la liste n'est pas vide, formate les éléments
            const formattedList = list.map(item => `- ${item}\n`);
            return formattedList.join(''); // Fusionne les éléments formatés en une seule chaîne
        }
    } catch (error) {
        createErrorLog(client, `Le formattage de la liste des personnes a échoué.`, "modules/event.js", "null")
    }
}

/**
 * Actualise l'embed d'event.
 * @returns {Embed} d'un event.
 */
function redrawEmbed(client, title, description, dateheure, participants, indecis, reservistes, footer) {
    try {
        const formattedParticipants = formatList(participants);
        const formattedIndecis = formatList(indecis);
        const formattedReservistes = formatList(reservistes);
        const embed = new Discord.EmbedBuilder()
            .setColor(client.color)
            .setTitle(title)
            .setDescription(description)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
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
    } catch (error) {
        createErrorLog(client, `Le redessin de l'embed a échoué.`, "modules/event.js", "null")
    }
}



function formatEventDateHeureValue(date, heure) {
    try {
        const epoch_timestamp = Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`)
    
        let epoch_timestamp1 = epoch_timestamp.toString()
        let correct_epoch_timestamp = epoch_timestamp1.substring(0, epoch_timestamp1.length - 3)
    
        return `Le <t:${correct_epoch_timestamp}:F> (<t:${correct_epoch_timestamp}:R>)`
    } catch (error) {
        createErrorLog(client, `Le formattage de la date et de l'heure de l'event a échoué.`, "modules/event.js", "null")
    }

}



module.exports = { updateChoice, redrawEmbed, formatEventDateHeureValue }