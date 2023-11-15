require("dotenv").config();
const Discord = require("discord.js")
const { updateChoice, redrawEmbed, formatEventDateHeureValue, createEventEmbed, getEventEmbedRows, sendMessage } = require("../functions/event");
const { getAdminPanelEmbed, getAdminPanelRows } = require("../functions/adminPanel")
const { getEventEditModal } = require("../functions/eventEdit")
const { getEventDeleteModal } = require("../functions/eventDelete")
const { formatEventDate, formatEventHour } = require("../functions/date")


module.exports = async (SoraBot, interaction, message, db) => {
    try {
        let username;

        if (interaction.member.nickname === null) {
            username = interaction.user.username;
        } else {
            username = interaction.member.nickname;
        }

        if (interaction.type === Discord.InteractionType.ApplicationCommandAutocomplete && interaction.commandName === "help") {
            let entry = interaction.options.getFocused();
            let choices = SoraBot.commands.filter(cmd => cmd.name.includes(entry));
            await interaction.respond(entry === "" ? SoraBot.commands.map(cmd => ({ name: cmd.name, value: cmd.name })) : choices.map(choice => ({ name: choice.name, value: choice.name })));
        }

        if (interaction.type === Discord.InteractionType.ApplicationCommand) {
            let command = require(`../commands/${interaction.commandName}`);
            command.run(SoraBot, interaction, interaction.options, SoraBot.db);
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
                        const epoch_timestamp = Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`);

                        if (!isNaN(epoch_timestamp)) {
                            titre.replace(/'/g, "\\'");
                            description.replace(/'/g, "\\'");

                            const embed = createEventEmbed(SoraBot, interaction, titre, description, date, heure);
                            const reply = await interaction.reply({ embeds: [embed], components: [getEventEmbedRows()], fetchReply: true });


                            let channel = SoraBot.channels.cache.get(interaction.channel.id);

                            const differenceTemps = epoch_timestamp - Date.now();
                            let differenceTempsTest = differenceTemps - 3600000

                            let timeoutId

                            if (differenceTempsTest > 0) {
                                timeoutId = setTimeout(() => sendMessage(SoraBot, interaction, message, channel, titre, reply.id), differenceTemps - 3600000); // Soustraire une heure en millisecondes (1 heure = 3600000 ms)
                            }


                            // Ajout de l'event dans la base de données
                            SoraBot.db.query(`INSERT INTO events (event_id, channel_id, event_creator, guild_name, event_title, event_description, event_date, event_hour, epoch_timestamp, rappel, rappelMessageId) 
                            VALUES ('${reply.id}', '${interaction.channel.id}','${interaction.user.id}','${interaction.guild.name}',"${titre}","${description}",'${date}','${heure}','${epoch_timestamp}','${timeoutId}','Null')`);




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

                        SoraBot.db.query(`SELECT rappel FROM events WHERE event_id=${eventId}`, (err, req) => {
                            clearTimeout(req[0].rappel);
                        })

                        SoraBot.db.query(`DELETE FROM events WHERE event_id = ${eventId}`)
                        SoraBot.db.query(`DELETE FROM members_event_choice WHERE event_id = ${eventId}`)

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

                        if (!isNaN(Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`))) {


                            SoraBot.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${interaction.message.reference.messageId}'`, (err, req) => {


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

                                const embed = redrawEmbed(SoraBot, titre, description, formatEventDateHeureValue(date, heure), participants, indecis, reservistes, footer)

                                SoraBot.db.query(`SELECT rappel FROM events WHERE event_id=${interaction.message.reference.messageId}`, (err, req) => {
                                    clearTimeout(req[0].rappel);

                                    const differenceTemps = epoch_timestamp - Date.now();
                                    let differenceTempsTest = differenceTemps - 3600000

                                    let channel = SoraBot.channels.cache.get(interaction.channel.id);

                                    titre = titre.substring(8)
                                    let timeoutId

                                    if (differenceTempsTest > 0) {
                                        timeoutId = setTimeout(() => sendMessage(SoraBot, interaction, message, channel, titre, interaction.message.reference.messageId), differenceTemps - 3600000); // Soustraire une heure en millisecondes (1 heure = 3600000 ms)
                                    }

                                    SoraBot.db.query(`UPDATE events 
                                    SET event_title="${titre}", event_description="${description}", event_date='${date}', event_hour='${heure}', epoch_timestamp='${epoch_timestamp}', rappel='${timeoutId}' WHERE event_id = '${interaction.message.reference.messageId}'`)

                                    channel = interaction.channel
                                    channel.messages.edit(interaction.message.reference.messageId, { embeds: [embed] })
                                    interaction.reply({ content: `L'événement a bien été modifié`, ephemeral: true })
                                })


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
                    await updateChoice(SoraBot, interaction, username, "Participant");
                    break;

                case "indecis":
                    await updateChoice(SoraBot, interaction, username, "Indécis");
                    break;

                case "reserviste":
                    await updateChoice(SoraBot, interaction, username, "Réserviste");
                    break;

                case "eventRetreat":
                    await updateChoice(SoraBot, interaction, username, "Se retirer")
                    break;



                // Admin Panel
                case "eventAdminPanel":
                    SoraBot.db.query(`SELECT * FROM events WHERE event_id = '${interaction.message.id}'`, async (err, req) => {
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
                                    embeds: [getAdminPanelEmbed(SoraBot, titre, description, date, heure)], components: [getAdminPanelRows()], ephemeral: true
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


