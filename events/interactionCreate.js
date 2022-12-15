const Discord = require("discord.js")
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

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

                    const [day, month, year] = date.split('/');
                    let dateTest = `${month}/${day}/${year}`

                    const [hour, min] = heure.split('h')
                    let heureTest = `${hour}:${min}`

                    const epoch_timestamp = Date.parse(`${dateTest} ${heureTest}`)

                    let epoch_timestamp1 = epoch_timestamp.toString()
                    let correct_epoch_timestamp = epoch_timestamp1.substring(0, epoch_timestamp1.length - 3)

                    if (!isNaN(Date.parse(`${dateTest} ${heureTest}`))) {
                        let embed = new Discord.EmbedBuilder()
                            .setColor(SoraBot.color)
                            .setTitle(`Event : ${titre}`)
                            .setDescription(`${description}`)
                            .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: false }))
                            .addFields(
                                { name: 'Date et heure', value: `Le <t:${correct_epoch_timestamp}:d> à <t:${correct_epoch_timestamp}:t> (<t:${correct_epoch_timestamp}:R>)` },
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
                                    .setCustomId('eventCancel')
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
                        SoraBot.db.query(`INSERT INTO events(event_id, channel_id, event_creator, guild_name, event_title, event_description, event_date, event_hour, epoch_timestamp) VALUES ('${reply.id}', '${interaction.channel.id}','${interaction.user.id}','${interaction.guild.name}','${correctedTitle}','${correctedDesc}','${date}','${heure}','${epoch_timestamp}')`)

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

                    const [day, month, year] = date.split('/');
                    let dateTest = `${month}/${day}/${year}`

                    const [hour, min] = heure.split('h')
                    let heureTest = `${hour}:${min}`

                    const epoch_timestamp = Date.parse(`${dateTest} ${heureTest}`)

                    let epoch_timestamp1 = epoch_timestamp.toString()
                    let correct_epoch_timestamp = epoch_timestamp1.substring(0, epoch_timestamp1.length - 3)


                    if (!isNaN(Date.parse(`${dateTest} ${heureTest}`))) {


                        SoraBot.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${interaction.message.reference.messageId}'`, (err, req) => {


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
                                .setTitle(`Event : ${titre}`)
                                .setDescription(description)
                                .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: true }))
                                .addFields(
                                    { name: 'Date et heure', value: `Le <t:${correct_epoch_timestamp}:d> à <t:${correct_epoch_timestamp}:t> (<t:${correct_epoch_timestamp}:R>)` },
                                )
                                .addFields(
                                    { name: '\u200B', value: '\u200B' },
                                    { name: '✅ Participants', value: `${participants}`, inline: true },
                                    { name: '❓Indécis', value: `${indecis}`, inline: true },
                                    { name: '🪑 Réservistes', value: `${reservistes}`, inline: true },
                                )
                                .setImage('https://i.stack.imgur.com/Fzh0w.png')
                                .setFooter({
                                    text: `Proposé par : ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL({ dynamic: false })
                                })


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

                            SoraBot.db.query(`UPDATE events SET event_title='${correctedTitle}', event_description='${correctedDesc}', event_date='${date}', event_hour='${heure}', epoch_timestamp='${epoch_timestamp}' WHERE event_id = '${interaction.message.reference.messageId}'`)

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

            let participants = []
            let indecis = []
            let reservistes = []

            interaction_user_id = interaction.user.id

            // let username
            // if (interaction.member.nickname === null) {
            //     username = interaction.user.id
            // } else {
            //     username = interaction.member.nickname
            // }


            switch (interaction.customId) {

                // PARTICIPANT
                case "participant":


                    SoraBot.db.query(`UPDATE guild_members SET user_tag = '${interaction.user.tag}', nickname = '${username}' WHERE user_id = '${interaction_user_id}'`)
                    SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Participant', guild_nickname='${username}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)

                    SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, veryall) => {
                        if (veryall.length < 1) {
                            await SoraBot.db.query(`INSERT INTO members_event_choice (user_id, guild_nickname, choice_name, event_id) VALUES ('${interaction_user_id}','${username}','Participant','${interaction.message.id}')`)
                        }

                        SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, all) => {


                            if (all[0].choice_name === 'Indécis') {
                                await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Participant', guild_nickname='${username}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)
                            }
                            if (all[0].choice_name === 'Réserviste') {
                                await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Participant', guild_nickname='${username}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)
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
                    SoraBot.db.query(`UPDATE guild_members SET user_tag = '${interaction.user.tag}', nickname = '${username}' WHERE user_id = '${interaction_user_id}'`)
                    SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Indécis', guild_nickname='${username}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)

                    SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, veryall) => {
                        if (veryall.length < 1) {
                            await SoraBot.db.query(`INSERT INTO members_event_choice (user_id, guild_nickname, choice_name, event_id) VALUES ('${interaction_user_id}','${username}','Indécis','${interaction.message.id}')`)
                        }

                        SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, all) => {


                            if (all[0].choice_name === 'Participant') {
                                await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Indécis', guild_nickname='${username}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)
                            }
                            if (all[0].choice_name === 'Réserviste') {
                                await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Indécis', guild_nickname='${username}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)
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

                    SoraBot.db.query(`UPDATE guild_members SET user_tag = '${interaction.user.tag}', nickname = '${username}' WHERE user_id = '${interaction_user_id}'`)
                    SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Réserviste', guild_nickname='${username}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)

                    SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, veryall) => {
                        if (veryall.length < 1) {
                            await SoraBot.db.query(`INSERT INTO members_event_choice (user_id, guild_nickname, choice_name, event_id) VALUES ('${interaction_user_id}','${username}','Indécis','${interaction.message.id}')`)
                        }

                        SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${interaction.message.id}' AND user_id = '${interaction_user_id}'`, async (err, all) => {


                            if (all[0].choice_name === 'Participant') {
                                await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Réserviste', guild_nickname='${username}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)
                            }
                            if (all[0].choice_name === 'Indécis') {
                                await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Réserviste', guild_nickname='${username}' WHERE user_id = '${interaction_user_id}' AND event_id = '${interaction.message.id}'`)
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
                    SoraBot.db.query(`UPDATE guild_members SET user_tag = '${interaction.user.tag}', nickname = '${username}' WHERE user_id = '${interaction_user_id}'`)
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



                // Admin Panel
                case "eventAdminPanel":


                    SoraBot.db.query(`SELECT * FROM events WHERE event_id = '${interaction.message.id}'`, async (err, req) => {


                        if (!req.length < 1) {
                            //console.log(interaction)
                            if (req[0].event_creator === interaction_user_id || interaction.user.id === '269715954466816002' || interaction.user.id === '968060045751382046') {

                                let title = interaction.message.embeds[0].title.substring(8, interaction.message.embeds[0].title.length)

                                let date = req[0].event_date
                                let heure = req[0].event_hour

                                let AdminPanel = new Discord.EmbedBuilder()
                                    .setColor(SoraBot.color)
                                    .setTitle("Administration")
                                    .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: true }))
                                    .addFields(
                                        { name: 'Titre : ', value: `${title}` },
                                        { name: 'Description : ', value: `${interaction.message.embeds[0].description}` },
                                        { name: 'Date : ', value: `${date}`, inline: true },
                                        { name: 'Heure : ', value: `${heure}`, inline: true },
                                    )

                                    .setImage('https://i.stack.imgur.com/Fzh0w.png')
                                    .setFooter({
                                        text: `Panel d'administration - ${SoraBot.user.username}`,
                                        iconURL: SoraBot.user.displayAvatarURL({ dynamic: false })
                                    })

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

                                []

                                await interaction.reply({ embeds: [AdminPanel], components: [row], ephemeral: true })

                            } else {
                                await interaction.reply({ content: `Vous n'avez pas les droits sur cet événement.`, ephemeral: true })
                            }
                        }
                    })
                    break;



                // Modifier l'événement
                case "eventEdit":

                    const modalEdit = new ModalBuilder()
                        .setCustomId('eventEditModal')
                        .setTitle(`Modification d'un événement.`);


                    const eventEditTitleInput = new TextInputBuilder()
                        .setCustomId('eventTitle')
                        .setLabel("Titre.")
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(100)
                        .setValue(`${interaction.message.embeds[0].fields[0].value}`)
                        .setRequired(true);

                    const eventEditDescInput = new TextInputBuilder()
                        .setCustomId('eventDesc')
                        .setLabel("Description et/ou détails.")
                        .setMaxLength(200)
                        .setValue(`${interaction.message.embeds[0].fields[1].value}`)
                        .setStyle(TextInputStyle.Paragraph);

                    const eventEditDateInput = new TextInputBuilder()
                        .setCustomId('eventDate')
                        .setLabel("Date de l'événement.")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('01/01/2000')
                        .setMaxLength(10)
                        .setValue(`${interaction.message.embeds[0].fields[2].value}`)
                        .setRequired(true);

                    const eventEditHourInput = new TextInputBuilder()
                        .setCustomId('eventHour')
                        .setLabel("Heure de l'événement.")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('00h00')
                        .setMaxLength(5)
                        .setValue(`${interaction.message.embeds[0].fields[3].value}`)
                        .setRequired(true);

                    const eventEditTitleRow = new ActionRowBuilder().addComponents(eventEditTitleInput);
                    const eventEditDescRow = new ActionRowBuilder().addComponents(eventEditDescInput);
                    const eventEditDateRow = new ActionRowBuilder().addComponents(eventEditDateInput);
                    const eventEditHourRow = new ActionRowBuilder().addComponents(eventEditHourInput);

                    // Add inputs to the modal
                    modalEdit.addComponents(eventEditTitleRow, eventEditDescRow, eventEditDateRow, eventEditHourRow);

                    // Show the modal to the user
                    await interaction.showModal(modalEdit);

                    break;



                // Annuler l'évent
                case "eventDelete":

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
                    await interaction.showModal(modal);

                    //await interaction.deferUpdate()
                    break;


                default:
                    break;
            }


        }
    } catch (error) {
        console.log(error)
    }


}