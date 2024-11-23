require("dotenv").config();
const Discord = require("discord.js")
const { createEventEmbed, getEventEmbedRows, getAdminPanelEmbed, getAdminPanelRows } = require("../modules/embeds")
const { updateChoice, redrawEmbed, formatEventDateHeureValue, sendMessage } = require("../modules/event");
const { getEventEditModal, getEventDeleteModal } = require("../modules/modals")
const { formatEventDate, formatEventHour } = require("../modules/date")
const { createInfoLog, createWarnLog, createErrorLog } = require("../modules/logs")
const { toggleSettingValue } = require("../modules/settings")
const { PermissionsBitField } = require('discord.js');

module.exports = async (client, interaction, message) => {
    try {

        let username;

        if (interaction.member.nickname === null) {
            username = interaction.user.globalName;
        } else {
            username = interaction.member.nickname;

        }
        username.replace(/'/g, "\\'");

        if (interaction.type === Discord.InteractionType.ApplicationCommandAutocomplete && interaction.commandName === "help") {
            let entry = interaction.options.getFocused();
            let choices = client.commands.filter(cmd => cmd.name.includes(entry));
            await interaction.respond(entry === "" ? client.commands.map(cmd => ({ name: cmd.name, value: cmd.name })) : choices.map(choice => ({ name: choice.name, value: choice.name })));
        }

        if (interaction.type === Discord.InteractionType.ApplicationCommand) {
            let command = require(`../commands/${interaction.commandName}`);
            command.run(client, interaction, interaction.options, client.db);
        }


        if (interaction.isModalSubmit()) {
            let titre, description, date, heure


            switch (interaction.customId) {
                case "eventCreationModal":
                    try {
                        titre = interaction.fields.getTextInputValue('eventTitle');
                        description = interaction.fields.getTextInputValue('eventDesc');
                        date = interaction.fields.getTextInputValue('eventDate');
                        heure = interaction.fields.getTextInputValue('eventHour');

                        const isValidDate = date.search('/') === 2 && date.length === 10;
                        const isValidHour = heure.search('h') === 2 && heure.length === 5;

                        if (isValidDate && isValidHour) {
                            let epochTimestamp = Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`);

                            epochTimestamp = epochTimestamp.toString().slice(0, -3);

                            if (!isNaN(epochTimestamp)) {
                                titre.replace(/'/g, "\\'");
                                description.replace(/'/g, "\\'");

                                const embed = createEventEmbed(client, interaction, username, titre, description, date, heure);
                                const reply = await interaction.reply({ embeds: [embed], components: [getEventEmbedRows()], fetchReply: true });

                                // Ajout de l'event dans la base de données
                                client.db.query(`INSERT INTO events (event_id, channel_id, event_creator, guild_id, event_title, event_description, event_date, event_hour, epoch_timestamp, rappel_message_id) 
                                VALUES ('${reply.id}', '${interaction.channel.id}','${interaction.user.id}','${interaction.guild.id}',"${titre}","${description}",'${date}','${heure}','${epochTimestamp}', 'Null')`);


                            } else {
                                await interaction.reply({ content: `Erreur(s) au niveau de la **date** et/ou de **l'heure**. Merci de respecter le format.`, ephemeral: true });
                            }
                        } else {
                            await interaction.reply({ content: `Erreur(s) au niveau de la **date** et/ou de **l'heure**. Merci de respecter le format.`, ephemeral: true });
                        }

                        createInfoLog(client, `L'interaction eventCreationModal a été exécuté avec succès.`, "events/interactionCreate.js", interaction.user.id)
                        break;

                    } catch (error) {
                        console.log(error)
                        createErrorLog(client, `L'interaction eventCreationModal a échoué.`, "events/interactionCreate.js", interaction.user.id)
                    }


                case "DeleteEventModal":
                    try {

                        titre = interaction.fields.getTextInputValue('eventTitleDelete');

                        if (titre.toLowerCase() === 'annuler') {
                            const eventId = interaction.message.reference.messageId;
                            channel = interaction.channel

                            client.db.query(`SELECT rappel_message_id FROM events WHERE event_id = ${eventId}`, async (req, res) => {
                                if (res[0].rappel_message_id !== 'Null') channel.messages.delete(res[0].rappel_message_id)

                                client.db.query(`DELETE FROM events WHERE event_id = ${eventId}`)
                                client.db.query(`DELETE FROM members_event_choice WHERE event_id = ${eventId}`)

                                channel.messages.delete(eventId)
                                await interaction.deferUpdate()
                            })

                        } else {
                            await interaction.reply({ content: `la validation a échouée; vous n'avez pas entré "annuler"`, ephemeral: true });
                        }

                        createInfoLog(client, `L'interaction eventDeleteModal a été exécuté avec succès.`, "events/interactionCreate.js", interaction.user.id)
                        break;
                    } catch (error) {
                        createErrorLog(client, `L'interaction eventDeleteModal a échoué.`, "events/interactionCreate.js", interaction.user.id)
                    }



                case "eventEditModal":
                    try {
                        let participants = []
                        let indecis = []
                        let reservistes = []

                        titre = interaction.fields.getTextInputValue('eventTitle');
                        description = interaction.fields.getTextInputValue('eventDesc');
                        date = interaction.fields.getTextInputValue('eventDate');
                        heure = interaction.fields.getTextInputValue('eventHour');

                        if (date.search('/') === 2 && date.length === 10 && heure.search('h') === 2 && heure.length === 5) {

                            let epochTimestamp = Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`)
                            epochTimestamp = epochTimestamp.toString().slice(0, -3);

                            if (!isNaN(Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`))) {


                                client.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${interaction.message.reference.messageId}'`, (err, req) => {


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

                                    titre = ("Event : " + titre).replace(/'/g, "\\'");
                                    description.replace(/'/g, "\\'")

                                    const footer = ({
                                        text: `Proposé par : ${interaction.user.username}`,
                                        iconURL: interaction.user.displayAvatarURL({ dynamic: false }),
                                    })

                                    const embed = redrawEmbed(client, titre, description, formatEventDateHeureValue(date, heure), participants, indecis, reservistes, footer)

                                    let channel = client.channels.cache.get(interaction.channel.id);

                                    client.db.query(`SELECT rappel_message_id FROM events WHERE event_id = '${interaction.message.reference.messageId}'`, (err, res) => {

                                        if (res[0].rappel_message_id != 'Null') {
                                            channel.messages.delete(res[0].rappel_message_id)
                                        }

                                        titre = titre.substring(8)
                                        client.db.query(`UPDATE events 
                                            SET event_title="${titre}", event_description="${description}", event_date='${date}', event_hour='${heure}', epoch_timestamp='${epochTimestamp}', rappel_message_id='Null' WHERE event_id = '${interaction.message.reference.messageId}'`)

                                        channel = interaction.channel
                                        channel.messages.edit(interaction.message.reference.messageId, { embeds: [embed] })
                                        interaction.deferUpdate()
                                    })


                                })
                            } else {
                                await interaction.reply({ content: `Erreur(s) au niveau de la **date** et/ou de **l'heure** : \nLa date doit être au format **"JJ/MM/AAAA"**.\nL'heure doit être au format **"HH__h__MM"**.`, ephemeral: true });
                            }
                        } else {
                            await interaction.reply({ content: `Erreur(s) au niveau de la **date** et/ou de **l'heure** : \nLa date doit être au format **"JJ/MM/AAAA"**.\nL'heure doit être au format **"HHhMM"**.`, ephemeral: true });
                        }

                        createInfoLog(client, `L'interaction eventEditModal a été exécuté avec succès.`, "events/interactionCreate.js", interaction.user.id)
                        break;
                    } catch (error) {
                        createErrorLog(client, `L'interaction eventEditModal a échoué.`, "events/interactionCreate.js", interaction.user.id)
                    }


                case "broadcastConfirm":
                    try {
                        let broadcastMessage = interaction.fields.getTextInputValue('broadcastMessage');
                        client.db.query(`SELECT activeChannel FROM guilds`, (err, res) => {
                            if (err) {
                                console.error(err);
                                return;
                            }

                            // Supprimer les éléments vides de la liste
                            const activeChannels = res.filter(row => row.activeChannel !== '');

                            // Boucler sur les éléments restants

                            for (const row of activeChannels) {
                                const activeChannelId = row.activeChannel;
                                const activeChannel = client.channels.cache.get(activeChannelId);

                                if (activeChannel) {
                                    activeChannel.send({content:`## ℹ️ Message du développeur de Météion:\n ${broadcastMessage}`});
                                } else {
                                    return
                                }
                            }

                        });
                        interaction.deferUpdate();
                        break;

                    } catch (error) {
                        console.log(error)
                        createErrorLog(client, `L'interaction eventCreationModal a échoué.`, "events/interactionCreate.js", interaction.user.id)
                    }


                default:
                    break;
            }
        }

        if (interaction.isButton()) {
            switch (interaction.customId) {


                case "participant":
                    await updateChoice(client, interaction, username, "Participant");
                    break;

                case "indecis":
                    await updateChoice(client, interaction, username, "Indécis");
                    break;

                case "reserviste":
                    await updateChoice(client, interaction, username, "Réserviste");
                    break;

                case "eventRetreat":
                    await updateChoice(client, interaction, username, "Se retirer")
                    break;



                // Admin Panel
                case "eventAdminPanel":
                    try {
                        client.db.query(`SELECT * FROM events WHERE event_id = '${interaction.message.id}'`, async (req, res) => {
                            if (res.length > 0) {
                                const isAdmin = res[0].event_creator === interaction.user.id ||
                                    interaction.user.id === process.env.SUPERADMIN1 ||
                                    interaction.user.id === process.env.SUPERADMIN2;

                                if (isAdmin) {
                                    let titre = interaction.message.embeds[0].title.substring(8)
                                    let description = interaction.message.embeds[0].description
                                    let date = res[0].event_date
                                    let heure = res[0].event_hour

                                    await interaction.reply({
                                        embeds: [getAdminPanelEmbed(client, titre, description, date, heure)], components: [getAdminPanelRows()], ephemeral: true
                                    });
                                } else {
                                    await interaction.reply({ content: `Vous n'avez pas les droits sur cet événement.`, ephemeral: true });
                                }
                            }
                        })

                    } catch (error) {
                        console.log(error)
                    }
                    break;


                // Modifier l'événement
                case "eventEdit":
                    let titre = interaction.message.embeds[0].fields[0].value
                    let description = interaction.message.embeds[0].fields[1].value
                    let date = interaction.message.embeds[0].fields[2].value
                    let heure = interaction.message.embeds[0].fields[3].value

                    await interaction.showModal(getEventEditModal(titre, description, date, heure));

                    break;



                // Annuler l'évent
                case "eventDelete":
                    await interaction.showModal(getEventDeleteModal());
                    break;


                case "toggleCloseEvent":
                    toggleSettingValue(client, interaction, 1, "close_event_value");
                    break;

                case "toggleEventReminder":
                    toggleSettingValue(client, interaction, 2, "event_reminder_value");
                    break;

                case "deleteSettingsMessage":
                    if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) interaction.message.delete()
                    else interaction.reply({ content: `Seuls les administrateurs du serveur peuvent supprimer ce message.`, ephemeral: true })
                    break;

                default:
                    break;
            }
        }
    } catch (error) {
        console.log(error)
    }
}

