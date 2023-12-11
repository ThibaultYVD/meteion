require("dotenv").config();
const Discord = require("discord.js")
const { createEventEmbed, getEventEmbedRows, getAdminPanelEmbed, getAdminPanelRows } = require("../modules/embeds")
const { updateChoice, redrawEmbed, formatEventDateHeureValue, sendMessage } = require("../modules/event");
const { getEventEditModal, getEventDeleteModal } = require("../modules/modals")
const { formatEventDate, formatEventHour } = require("../modules/date")


module.exports = async (client, interaction, message) => {
    try {
        let username;

        if (interaction.member.nickname === null) {
            username = interaction.user.globalName;
        } else {
            username = interaction.member.nickname;
        }

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
                    titre = interaction.fields.getTextInputValue('eventTitle');
                    description = interaction.fields.getTextInputValue('eventDesc');
                    date = interaction.fields.getTextInputValue('eventDate');
                    heure = interaction.fields.getTextInputValue('eventHour');

                    const isValidDate = date.search('/') === 2 && date.length === 10;
                    const isValidHour = heure.search('h') === 2 && heure.length === 5;

                    if (isValidDate && isValidHour) {
                        let epoch_timestamp = Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`);

                        epoch_timestamp = epoch_timestamp.toString().slice(0, -3);

                        if (!isNaN(epoch_timestamp)) {
                            titre.replace(/'/g, "\\'");
                            description.replace(/'/g, "\\'");

                            const embed = createEventEmbed(client, interaction, titre, description, date, heure);
                            const reply = await interaction.reply({ embeds: [embed], components: [getEventEmbedRows()], fetchReply: true });

                            // Ajout de l'event dans la base de données
                            client.db.query(`INSERT INTO events (event_id, channel_id, event_creator, guild_name, event_title, event_description, event_date, event_hour, epoch_timestamp, rappelMessageId) 
                            VALUES ('${reply.id}', '${interaction.channel.id}','${interaction.user.id}','${interaction.guild.name}',"${titre}","${description}",'${date}','${heure}','${epoch_timestamp}', 'Null')`);


                        } else {
                            await interaction.reply({ content: `Erreur(s) au niveau de la **date** et/ou de **l'heure**. Merci de respecter le format.`, ephemeral: true });
                        }
                    } else {
                        await interaction.reply({ content: `Erreur(s) au niveau de la **date** et/ou de **l'heure**. Merci de respecter le format.`, ephemeral: true });
                    }


                    break;


                case "DeleteEventModal":
                    titre = interaction.fields.getTextInputValue('eventTitleDelete');

                    if (titre.toLowerCase() === 'annuler') {
                        const eventId = interaction.message.reference.messageId;


                        client.db.query(`DELETE FROM events WHERE event_id = ${eventId}`)
                        client.db.query(`DELETE FROM members_event_choice WHERE event_id = ${eventId}`)

                        channel = interaction.channel
                        channel.messages.delete(eventId)
                        await interaction.reply({ content: `L'événement a bien été supprimé.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: `La validation a échoué.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                    }
                    break;



                case "eventEditModal":
                    let participants = []
                    let indecis = []
                    let reservistes = []

                    titre = interaction.fields.getTextInputValue('eventTitle');
                    description = interaction.fields.getTextInputValue('eventDesc');
                    date = interaction.fields.getTextInputValue('eventDate');
                    heure = interaction.fields.getTextInputValue('eventHour');

                    if (date.search('/') === 2 && date.length === 10 && heure.search('h') === 2 && heure.length === 5) {

                        let epoch_timestamp = Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`)
                        epoch_timestamp = epoch_timestamp.toString().slice(0, -3);

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

                                titre = titre.substring(8)
                                client.db.query(`UPDATE events 
                                    SET event_title="${titre}", event_description="${description}", event_date='${date}', event_hour='${heure}', epoch_timestamp='${epoch_timestamp}' WHERE event_id = '${interaction.message.reference.messageId}'`)

                                channel = interaction.channel
                                channel.messages.edit(interaction.message.reference.messageId, { embeds: [embed] })
                                interaction.reply({ content: `L'événement a bien été modifié`, ephemeral: true })


                            })
                        } else {
                            await interaction.reply({ content: `Erreur(s) au niveau de la **date** et/ou de **l'heure** : \nLa date doit être au format **"JJ/MM/AAAA"**.\nL'heure doit être au format **"HH__h__MM"**.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                        }
                    } else {
                        await interaction.reply({ content: `Erreur(s) au niveau de la **date** et/ou de **l'heure** : \nLa date doit être au format **"JJ/MM/AAAA"**.\nL'heure doit être au format **"HHhMM"**.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                    }
                    break;

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
                    client.db.query(`SELECT * FROM events WHERE event_id = '${interaction.message.id}'`, async (err, req) => {
                        if (req.length > 0) {
                            const isAdmin = req[0].event_creator === interaction.user.id ||
                                interaction.user.id === process.env.SUPERADMIN1 ||
                                interaction.user.id === process.env.SUPERADMIN2;

                            if (isAdmin) {
                                let titre = interaction.message.embeds[0].title.substring(8)
                                let description = interaction.message.embeds[0].description
                                let date = req[0].event_date
                                let heure = req[0].event_hour

                                await interaction.reply({
                                    embeds: [getAdminPanelEmbed(client, titre, description, date, heure)], components: [getAdminPanelRows()], ephemeral: true
                                });
                            } else {
                                await interaction.reply({ content: `Vous n'avez pas les droits sur cet événement.`, ephemeral: true });
                            }
                        } else {
                            await interaction.reply({ content: `erreur`, ephemeral: true });
                        }
                    })
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

                default:
                    break;
            }


        }
    } catch (error) {
        console.log(error)
    }
}


