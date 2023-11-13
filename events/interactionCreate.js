require("dotenv").config();
const Discord = require("discord.js")
const { updateChoice, redrawEmbed, formatEventDateHeureValue } = require("../functions/event");
const { getAdminPanelEmbed, getAdminPanelRows } = require("../functions/adminPanel")
const { getEventEditModal } = require("../functions/eventEdit")
const { getEventDeleteModal } = require("../functions/eventDelete")
const { formatEventDate, formatEventHour } = require("../functions/date")


module.exports = async (SoraBot, interaction, message, db) => {
    try {
        let username
        if (interaction.member.nickname === null) {
            username = interaction.user.username
        } else {
            username = interaction.member.nickname
        }

        if (interaction.type === Discord.InteractionType.ApplicationCommandAutocomplete) {
            let entry = interaction.options.getFocused()

            if (interaction.commandName === "help") {
                let choices = SoraBot.commands.filter(cmd => cmd.name.includes(entry))
                await interaction.respond(entry === "" ? SoraBot.commands.map(cmd => ({ name: cmd.name, value: cmd.name })) : choices.map(choice => ({ name: choice.name, value: choice.name })))
            }
        }

        if (interaction.type === Discord.InteractionType.ApplicationCommand) {
            let command = require(`../commands/${interaction.commandName}`)
            command.run(SoraBot, interaction, interaction.options, SoraBot.db)
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'eventCreationModal') {

                const titre = interaction.fields.getTextInputValue('eventTitle');
                const description = interaction.fields.getTextInputValue('eventDesc');
                let date = interaction.fields.getTextInputValue('eventDate');
                let heure = interaction.fields.getTextInputValue('eventHour');


                if (date.search('/') === 2 && date.length === 10 && heure.search('h') === 2 && heure.length === 5) {

                    const epoch_timestamp = Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`)

                    if (!isNaN(Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`))) {
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
                                text: `Proposé par : ${username}`,
                                iconURL: interaction.user.displayAvatarURL({ dynamic: false }),
                            })


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

                        var output = titre.split(`'`), i;
                        var correctedTitle = ""
                        for (i = 0; i < output.length; i++) {
                            correctedTitle += `${output[i]}''`
                        }

                        var output1 = description.split(`'`), i;
                        let correctedDesc = ""
                        for (i = 0; i < output1.length; i++) {
                            correctedDesc += `${output1[i]}''`
                        }

                        correctedTitle = correctedTitle.substring(0, correctedTitle.length - 2);
                        correctedDesc = correctedDesc.substring(0, correctedDesc.length - 2);

                        const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true })
                        // Ajout de l'event dans la base de données
                        SoraBot.db.query(`INSERT INTO events(event_id, channel_id, event_creator, guild_name, event_title, event_description, event_date, event_hour, epoch_timestamp) 
                        VALUES ('${reply.id}', '${interaction.channel.id}','${interaction.user.id}','${interaction.guild.name}','${correctedTitle}','${correctedDesc}','${date}','${heure}','${epoch_timestamp}')`)

                    } else {
                        await interaction.reply({ content: `Erreur(s) au niveau de la **date** et/ou de **l'heure** : \nLa date doit être au format **"JJ/MM/AAAA"**.\nL'heure doit être au format **"HH__h__MM"**.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                    }
                } else {
                    await interaction.reply({ content: `Erreur(s) au niveau de la **date** et/ou de **l'heure** : \nLa date doit être au format **"JJ/MM/AAAA"**.\nL'heure doit être au format **"HHhMM"**.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                }
            }

            if (interaction.customId === 'DeleteEventModal') {
                const titre = interaction.fields.getTextInputValue('eventTitleDelete');

                if (titre.toLowerCase() === 'annuler') {
                    SoraBot.db.query(`DELETE FROM events WHERE event_id = ${interaction.message.reference.messageId}`)
                    SoraBot.db.query(`DELETE FROM members_event_choice WHERE event_id = ${interaction.message.reference.messageId}`)

                    channel = interaction.channel
                    //channel.messages.delete(`${interaction.message.id}`)
                    channel.messages.delete(`${interaction.message.reference.messageId}`)
                    await interaction.reply({ content: `L'événement a bien été supprimé.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                } else {
                    await interaction.reply({ content: `La validation a échoué.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                }


            }

            if (interaction.customId === 'eventEditModal') {

                let participants = []
                let indecis = []
                let reservistes = []

                const titre = interaction.fields.getTextInputValue('eventTitle');
                const description = interaction.fields.getTextInputValue('eventDesc');
                const date = interaction.fields.getTextInputValue('eventDate');
                const heure = interaction.fields.getTextInputValue('eventHour');

                if (date.search('/') === 2 && date.length === 10 && heure.search('h') === 2 && heure.length === 5) {

                    const epoch_timestamp = Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`)

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

                            stringEvent = "Event : "
                            const newtitre = stringEvent + titre
                            newtitre.replace(/'/g, "\\'")

                            description.replace(/'/g, "\\'")

                            const footer = ({
                                text: `Proposé par : ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL({ dynamic: false }),
                            })
                            const embed = redrawEmbed(SoraBot, interaction, newtitre, description, formatEventDateHeureValue(date, heure), participants, indecis, reservistes, footer)

                            SoraBot.db.query(`UPDATE events SET event_title="${newtitre}", event_description="${description}", event_date='${date}', event_hour='${heure}', epoch_timestamp='${epoch_timestamp}' WHERE event_id = '${interaction.message.reference.messageId}'`)

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
                                const AdminPanelEmbed = getAdminPanelEmbed(
                                    SoraBot,
                                    interaction.message.embeds[0].title.substring(8),
                                    interaction.message.embeds[0].description,
                                    req[0].event_date,
                                    req[0].event_hour)
                                const AdminPanelRow = getAdminPanelRows()

                                await interaction.reply({ embeds: [AdminPanelEmbed], components: [AdminPanelRow], ephemeral: true });
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
                    const editEventModal = getEventEditModal(
                        interaction.message.embeds[0].fields[0].value,
                        interaction.message.embeds[0].fields[1].value,
                        interaction.message.embeds[0].fields[2].value,
                        interaction.message.embeds[0].fields[3].value
                    )

                    // Show the modal to the user
                    await interaction.showModal(editEventModal);

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


