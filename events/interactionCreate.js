const Discord = require("discord.js")
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = async (SoraBot, interaction, message, db) => {
    try {
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
            if (interaction.customId === 'myModal') {

                const titre = interaction.fields.getTextInputValue('eventTitle');
                const description = interaction.fields.getTextInputValue('eventDesc');
                let date = interaction.fields.getTextInputValue('eventDate');
                let heure = interaction.fields.getTextInputValue('eventHour');

                if (date.search('/') === 2 && date.length === 10 && heure.search('h') === 2 && heure.length === 5) {

                    const [day, month, year] = date.split('/');
                    let dateTest = `${month}/${day}/${year}`

                    const [hour, min] = heure.split('h')
                    let heureTest = `${hour}:${min}`

                    if (!isNaN(Date.parse(`${dateTest} ${heureTest}`))) {
                        let embed = new Discord.EmbedBuilder()
                            .setColor(SoraBot.color)
                            .setTitle(`Event : ${titre}`)
                            .setDescription(`${description}`)
                            .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: false }))
                            .addFields(
                                { name: 'Date et heure', value: `Le __${date}__ à __${heure}__` },
                            )
                            .addFields(
                                { name: '\u200B', value: '\u200B' },
                                { name: '✅ Participants', value: '\u200B', inline: true },
                                { name: '❓Indécis', value: '\u200B', inline: true },
                                { name: '🪑 Réservistes', value: '\u200B', inline: true },
                            )
                            .setImage('https://i.stack.imgur.com/Fzh0w.png')
                            .setFooter({
                                text: `Proposé par : ${interaction.member.nickname}`,
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
                                    .setCustomId('eventCancel')
                                    .setLabel('Se retirer')
                                    .setStyle(Discord.ButtonStyle.Danger),
                                new Discord.ButtonBuilder()
                                    .setCustomId('eventDelete')
                                    .setLabel(`Annuler l'évenement`)
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
                        SoraBot.db.query(`INSERT INTO events(event_id, channel_id, event_creator, guild_name, event_title, event_description, event_date, event_hour) VALUES ('${reply.id}', '${interaction.channel.id}','${interaction.user.id}','${interaction.guild.name}','${correctedTitle}','${correctedDesc}','${date}','${heure}')`)

                    } else {
                        await interaction.reply({ content: `Erreur(s) au niveau de la **date** et/ou de **l'heure** : \nLa date doit être au format **"JJ/MM/AAAA"**.\nL'heure doit être au format **"HH__h__MM"**.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                    }
                } else {
                    await interaction.reply({ content: `Erreur(s) au niveau de la **date** et/ou de **l'heure** : \nLa date doit être au format **"JJ/MM/AAAA"**.\nL'heure doit être au format **"HHhMM"**.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                }
            }

            if (interaction.customId === 'DeleteEventModal') {
                const titre = interaction.fields.getTextInputValue('eventTitleDelete');

                if (titre.toLowerCase() === 'supprimer') {
                    SoraBot.db.query(`DELETE FROM events WHERE event_id = ${interaction.message.id}`)
                    SoraBot.db.query(`DELETE FROM members_event_choice WHERE event_id = ${interaction.message.id}`)

                    channel = interaction.channel
                    channel.messages.delete(`${interaction.message.id}`)
                    await interaction.reply({ content: `L'événement a bien été supprimé.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                } else {
                    await interaction.reply({ content: `La validation a échoué.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                }


            }
        }

        if (interaction.isButton()) {

            //let receivedembed = interaction.message.embeds[0]
            //let event_id = interaction.message.id

            let participants = []
            let indecis = []
            let reservistes = []

            interaction_user_id = interaction.user.id

            let username
            if (interaction.member.nickname === null) {
                username = interaction.user.id
            } else {
                username = interaction.member.nickname
            }


            switch (interaction.customId) {

                // PARTICIPANT
                case "participant":


                    SoraBot.db.query(`UPDATE guild_members SET user_tag = '${interaction.user.tag}', nickname = '${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}'`)
                    SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Participant', guild_nickname='${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)

                    SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, veryall) => {
                        if (veryall.length < 1) {
                            await SoraBot.db.query(`INSERT INTO members_event_choice (user_id, guild_nickname, choice_name, event_id) VALUES ('${interaction_user_id}','${interaction.member.nickname}','Participant','${interaction.message.id}')`)
                        }

                        SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, all) => {


                            if (all[0].choice_name === 'Indécis') {
                                await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Participant', guild_nickname='${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)
                            }
                            if (all[0].choice_name === 'Réserviste') {
                                await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Participant', guild_nickname='${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)
                            }

                            SoraBot.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${interaction.message.id}'`, (err, req) => {


                                for (let i = 0; i < req.length; i++) {
                                    switch (req[i].choice_name) {
                                        case 'Participant':
                                            participants.push('\n - ' + req[i].guild_nickname)
                                            break;
                                        case 'Indécis':
                                            indecis.push('\n - ' + req[i].guild_nickname)
                                            break;
                                        case 'Réserviste':
                                            reservistes.push('\n - ' + req[i].guild_nickname)
                                            break;
                                        default:
                                            break;
                                    }
                                }

                                if (participants.length === 0) {
                                    participants.push('\u200B')
                                }

                                if (indecis.length === 0) {
                                    indecis.push('\u200B')
                                }

                                if (reservistes.length === 0) {
                                    reservistes.push('\u200B')
                                }

                                let embed = new Discord.EmbedBuilder()
                                    .setColor(SoraBot.color)
                                    .setTitle(interaction.message.embeds[0].title)
                                    .setDescription(interaction.message.embeds[0].description)
                                    .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: true }))
                                    .addFields(
                                        { name: 'Date et heure', value: interaction.message.embeds[0].fields[0].value },
                                    )
                                    .addFields(
                                        { name: '\u200B', value: '\u200B' },
                                        { name: '✅ Participants', value: `${participants}`, inline: true },
                                        { name: '❓Indécis', value: `${indecis}`, inline: true },
                                        { name: '🪑 Réservistes', value: `${reservistes}`, inline: true },
                                    )
                                    .setImage('https://i.stack.imgur.com/Fzh0w.png')
                                    .setFooter(interaction.message.embeds[0].footer)

                                interaction.message.edit({ embeds: [embed] });
                            })
                        })

                    })
                    await interaction.deferUpdate()
                    break;



                // INDECIS
                case "indecis":
                    SoraBot.db.query(`UPDATE guild_members SET user_tag = '${interaction.user.tag}', nickname = '${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}'`)
                    SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Indécis', guild_nickname='${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)

                    SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, veryall) => {
                        if (veryall.length < 1) {
                            await SoraBot.db.query(`INSERT INTO members_event_choice (user_id, guild_nickname, choice_name, event_id) VALUES ('${interaction_user_id}','${username}','Indécis','${interaction.message.id}')`)
                        }

                        SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, all) => {


                            if (all[0].choice_name === 'Participant') {
                                await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Indécis', guild_nickname='${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)
                            }
                            if (all[0].choice_name === 'Réserviste') {
                                await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Indécis', guild_nickname='${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)
                            }

                            SoraBot.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${interaction.message.id}'`, (err, req) => {


                                for (let i = 0; i < req.length; i++) {
                                    switch (req[i].choice_name) {
                                        case 'Participant':
                                            participants.push('\n - ' + req[i].guild_nickname)
                                            break;
                                        case 'Indécis':
                                            indecis.push('\n - ' + req[i].guild_nickname)
                                            break;
                                        case 'Réserviste':
                                            reservistes.push('\n - ' + req[i].guild_nickname)
                                            break;
                                        default:
                                            break;
                                    }
                                }


                                if (participants.length === 0) {
                                    participants.push('\u200B')
                                }

                                if (indecis.length === 0) {
                                    indecis.push('\u200B')
                                }

                                if (reservistes.length === 0) {
                                    reservistes.push('\u200B')
                                }

                                let embed = new Discord.EmbedBuilder()
                                    .setColor(SoraBot.color)
                                    .setTitle(interaction.message.embeds[0].title)
                                    .setDescription(interaction.message.embeds[0].description)
                                    .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: true }))
                                    .addFields(
                                        { name: 'Date et heure', value: interaction.message.embeds[0].fields[0].value },
                                    )
                                    .addFields(
                                        { name: '\u200B', value: '\u200B' },
                                        { name: '✅ Participants', value: `${participants}`, inline: true },
                                        { name: '❓Indécis', value: `${indecis}`, inline: true },
                                        { name: '🪑 Réservistes', value: `${reservistes}`, inline: true },
                                    )
                                    .setImage('https://i.stack.imgur.com/Fzh0w.png')
                                    .setFooter(interaction.message.embeds[0].footer)

                                interaction.message.edit({ embeds: [embed] });
                            })
                        })

                    })
                    await interaction.deferUpdate()
                    break;





                // RESERVISTE
                case "reserviste":

                    SoraBot.db.query(`UPDATE guild_members SET user_tag = '${interaction.user.tag}', nickname = '${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}'`)
                    SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Réserviste', guild_nickname='${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)

                    SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, veryall) => {
                        if (veryall.length < 1) {
                            await SoraBot.db.query(`INSERT INTO members_event_choice (user_id, guild_nickname, choice_name, event_id) VALUES ('${interaction_user_id}','${username}','Indécis','${interaction.message.id}')`)
                        }

                        SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, all) => {


                            if (all[0].choice_name === 'Participant') {
                                await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Réserviste', guild_nickname='${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)
                            }
                            if (all[0].choice_name === 'Indécis') {
                                await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Réserviste', guild_nickname='${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)
                            }

                            SoraBot.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${interaction.message.id}'`, (err, req) => {


                                for (let i = 0; i < req.length; i++) {
                                    switch (req[i].choice_name) {
                                        case 'Participant':
                                            participants.push('\n - ' + req[i].guild_nickname)
                                            break;
                                        case 'Indécis':
                                            indecis.push('\n - ' + req[i].guild_nickname)
                                            break;
                                        case 'Réserviste':
                                            reservistes.push('\n - ' + req[i].guild_nickname)
                                            break;
                                        default:
                                            break;
                                    }
                                }


                                if (participants.length === 0) {
                                    participants.push('\u200B')
                                }

                                if (indecis.length === 0) {
                                    indecis.push('\u200B')
                                }

                                if (reservistes.length === 0) {
                                    reservistes.push('\u200B')
                                }

                                let embed = new Discord.EmbedBuilder()
                                    .setColor(SoraBot.color)
                                    .setTitle(interaction.message.embeds[0].title)
                                    .setDescription(interaction.message.embeds[0].description)
                                    .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: true }))
                                    .addFields(
                                        { name: 'Date et heure', value: interaction.message.embeds[0].fields[0].value },
                                    )
                                    .addFields(
                                        { name: '\u200B', value: '\u200B' },
                                        { name: '✅ Participants', value: `${participants}`, inline: true },
                                        { name: '❓Indécis', value: `${indecis}`, inline: true },
                                        { name: '🪑 Réservistes', value: `${reservistes}`, inline: true },
                                    )
                                    .setImage('https://i.stack.imgur.com/Fzh0w.png')
                                    .setFooter(interaction.message.embeds[0].footer)

                                interaction.message.edit({ embeds: [embed] });
                            })
                        })
                    })
                    await interaction.deferUpdate()
                    break;



                // SE RETIRER
                case "eventCancel":
                    SoraBot.db.query(`UPDATE guild_members SET user_tag = '${interaction.user.tag}', nickname = '${interaction.member.nickname}' WHERE user_id = '${interaction_user_id}'`)
                    SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, veryall) => {


                        if (!veryall.length < 1) {

                            SoraBot.db.query(`DELETE FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, all) => {


                                SoraBot.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${interaction.message.id}'`, (err, req) => {


                                    for (let i = 0; i < req.length; i++) {
                                        switch (req[i].choice_name) {
                                            case 'Participant':
                                                participants.push('\n - ' + req[i].guild_nickname)
                                                break;
                                            case 'Indécis':
                                                indecis.push('\n - ' + req[i].guild_nickname)
                                                break;
                                            case 'Réserviste':
                                                reservistes.push('\n - ' + req[i].guild_nickname)
                                                break;
                                            default:
                                                break;
                                        }
                                    }


                                    if (participants.length === 0) {
                                        participants.push('\u200B')
                                    }

                                    if (indecis.length === 0) {
                                        indecis.push('\u200B')
                                    }

                                    if (reservistes.length === 0) {
                                        reservistes.push('\u200B')
                                    }

                                    let embed = new Discord.EmbedBuilder()
                                        .setColor(SoraBot.color)
                                        .setTitle(interaction.message.embeds[0].title)
                                        .setDescription(interaction.message.embeds[0].description)
                                        .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: true }))
                                        .addFields(
                                            { name: 'Date et heure', value: interaction.message.embeds[0].fields[0].value },
                                        )
                                        .addFields(
                                            { name: '\u200B', value: '\u200B' },
                                            { name: '✅ Participants', value: `${participants}`, inline: true },
                                            { name: '❓Indécis', value: `${indecis}`, inline: true },
                                            { name: '🪑 Réservistes', value: `${reservistes}`, inline: true },
                                        )
                                        .setImage('https://i.stack.imgur.com/Fzh0w.png')
                                        .setFooter(interaction.message.embeds[0].footer)

                                    interaction.message.edit({ embeds: [embed] });
                                    interaction.deferUpdate()
                                })
                            })

                        } else {
                            interaction.deferUpdate()
                        }
                    })
                    break;

                case "eventDelete":
                    SoraBot.db.query(`SELECT event_creator FROM events WHERE event_id = '${interaction.message.id}'`, async (err, req) => {


                        if (!req.length < 1) {
                            if (req[0].event_creator === interaction_user_id) {

                                const modal = new ModalBuilder()
                                    .setCustomId('DeleteEventModal')
                                    .setTitle(`⚠️Annuler un événement⚠️`);


                                const eventTitleInput = new TextInputBuilder()
                                    .setCustomId('eventTitleDelete')
                                    .setLabel(`⚠️Entrez "SUPPRIMER" pour annuler l'évent.⚠️`)
                                    .setStyle(TextInputStyle.Short)
                                    .setPlaceholder('Supprimer')
                                    .setRequired(true);

                                const firstActionRow = new ActionRowBuilder().addComponents(eventTitleInput);

                                modal.addComponents(firstActionRow);
                                //await interaction.reply({ content: `Event suppr.`, ephemeral: true })
                                await interaction.showModal(modal);

                            } else {
                                await interaction.reply({ content: `Vous ne pouvez pas supprimer cet événement.`, ephemeral: true })
                            }

                        }


                    })
                    break;


                default:
                    break;
            }


        }
    } catch (error) {
        console.log(error)
    }


}