const Discord = require("discord.js")

module.exports = async (SoraBot, interaction, message, db) => {

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

    if (interaction.isButton()) {

        let receivedembed = interaction.message.embeds[0]
        let event_id = interaction.message.id

        let participants = []
        let indecis = []
        let reservistes = []

        let event_title = receivedembed.title
        let event_description = receivedembed.description

        interaction_user_id = interaction.user.id

        let username
        if (interaction.member.nickname === null) {
            username = interaction.user.id
        } else {
            username = interaction.member.nickname
        }





        if (interaction.customId === "participant") {


            SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${event_id}' AND user_id = '${interaction_user_id}'`, async (err, veryall) => {
                if (veryall.length < 1) {
                    await SoraBot.db.query(`INSERT INTO members_event_choice (user_id, guild_nickname, choice_name, event_id) VALUES ('${interaction_user_id}','${username}','Participant','${event_id}')`)
                }

                SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${event_id}' AND user_id = '${interaction_user_id}'`, async (err, all) => {


                    if (all[0].choice_name === 'Indécis') {
                        await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Participant' WHERE user_id = '${interaction_user_id}' AND event_id = '${event_id}'`)
                    }
                    if (all[0].choice_name === 'Réserviste') {
                        await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Participant' WHERE user_id = '${interaction_user_id}' AND event_id = '${event_id}'`)
                    }

                    SoraBot.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${event_id}'`, (err, req) => {


                        for (let i = 0; i < req.length; i++) {
                            if (req[i].choice_name == 'Participant') {
                                participants.push('\n - ' + req[i].guild_nickname)
                            } else if (req[i].choice_name == 'Indécis') {
                                indecis.push('\n - ' + req[i].guild_nickname)
                            } else if (req[i].choice_name == 'Réserviste') {
                                reservistes.push('\n - ' + req[i].guild_nickname)
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
                            .setTitle(event_title)
                            .setDescription(event_description)
                            .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: true }))
                            .addFields(
                                { name: 'Date et heure', value: receivedembed.fields[0].value },
                            )
                            .addFields(
                                { name: '\u200B', value: '\u200B' },
                                { name: '✅ Participants', value: `${participants}`, inline: true},
                                { name: '❓Indécis', value: `${indecis}`, inline: true },
                                { name: '🪑 Réservistes', value: `${reservistes}`, inline: true },
                            )
                            .setImage('https://i.stack.imgur.com/Fzh0w.png')
                            .setFooter(receivedembed.footer)

                        interaction.message.edit({ embeds: [embed] });
                    })
                })
               
            })
            await interaction.deferUpdate()

        } else if (interaction.customId === "indecis") {
            //interaction.reply({ content: `Tu as choisi Indécis`, ephemeral: true })

            SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${event_id}' AND user_id = '${interaction_user_id}'`, async (err, veryall) => {
                if (veryall.length < 1) {
                    await SoraBot.db.query(`INSERT INTO members_event_choice (user_id, guild_nickname, choice_name, event_id) VALUES ('${interaction_user_id}','${username}','Indécis','${event_id}')`)
                }

                SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${event_id}' AND user_id = '${interaction_user_id}'`, async (err, all) => {


                    if (all[0].choice_name === 'Participant') {
                        await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Indécis' WHERE user_id = '${interaction_user_id}' AND event_id = '${event_id}'`)
                    }
                    if (all[0].choice_name === 'Réserviste') {
                        await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Indécis' WHERE user_id = '${interaction_user_id}' AND event_id = '${event_id}'`)
                    }

                    SoraBot.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${event_id}'`, (err, req) => {


                        for (let i = 0; i < req.length; i++) {
                            if (req[i].choice_name == 'Participant') {
                                participants.push('\n - ' + req[i].guild_nickname)
                            } else if (req[i].choice_name == 'Indécis') {
                                indecis.push('\n - ' + req[i].guild_nickname)
                            } else if (req[i].choice_name == 'Réserviste') {
                                reservistes.push('\n - ' + req[i].guild_nickname)
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
                            .setTitle(event_title)
                            .setDescription(event_description)
                            .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: true }))
                            .addFields(
                                { name: 'Date et heure', value: receivedembed.fields[0].value },
                            )
                            .addFields(
                                { name: '\u200B', value: '\u200B' },
                                { name: '✅ Participants', value: `${participants}`, inline: true},
                                { name: '❓Indécis', value: `${indecis}`, inline: true },
                                { name: '🪑 Réservistes', value: `${reservistes}`, inline: true },
                            )
                            .setImage('https://i.stack.imgur.com/Fzh0w.png')
                            .setFooter(receivedembed.footer)

                        interaction.message.edit({ embeds: [embed] });
                    })
                })
                
            })
            await interaction.deferUpdate()


        } else if (interaction.customId === "reserviste") {
            //interaction.reply({ content: `Tu as choisi Réserviste`, ephemeral: true })

            SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${event_id}' AND user_id = '${interaction_user_id}'`, async (err, veryall) => {
                if (veryall.length < 1) {
                    await SoraBot.db.query(`INSERT INTO members_event_choice (user_id, guild_nickname, choice_name, event_id) VALUES ('${interaction_user_id}','${username}','Indécis','${event_id}')`)
                }

                SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${event_id}' AND user_id = '${interaction_user_id}'`, async (err, all) => {


                    if (all[0].choice_name === 'Participant') {
                        await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Réserviste' WHERE user_id = '${interaction_user_id}' AND event_id = '${event_id}'`)
                    }
                    if (all[0].choice_name === 'Indécis') {
                        await SoraBot.db.query(`UPDATE members_event_choice SET choice_name = 'Réserviste' WHERE user_id = '${interaction_user_id}' AND event_id = '${event_id}'`)
                    }

                    SoraBot.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${event_id}'`, (err, req) => {


                        for (let i = 0; i < req.length; i++) {
                            if (req[i].choice_name == 'Participant') {
                                participants.push('\n - ' + req[i].guild_nickname)
                            } else if (req[i].choice_name == 'Indécis') {
                                indecis.push('\n - ' + req[i].guild_nickname)
                            } else if (req[i].choice_name == 'Réserviste') {
                                reservistes.push('\n - ' + req[i].guild_nickname)
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
                            .setTitle(event_title)
                            .setDescription(event_description)
                            .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: true }))
                            .addFields(
                                { name: 'Date et heure', value: receivedembed.fields[0].value },
                            )
                            .addFields(
                                { name: '\u200B', value: '\u200B' },
                                { name: '✅ Participants', value: `${participants}`, inline: true},
                                { name: '❓Indécis', value: `${indecis}`, inline: true },
                                { name: '🪑 Réservistes', value: `${reservistes}`, inline: true },
                            )
                            .setImage('https://i.stack.imgur.com/Fzh0w.png')
                            .setFooter(receivedembed.footer)

                        interaction.message.edit({ embeds: [embed] });
                    })
                })
            })
            await interaction.deferUpdate()
        }else if (interaction.customId === "eventCancel") {
            //interaction.reply({ content: `Tu as choisi Indécis`, ephemeral: true })

            SoraBot.db.query(`SELECT * FROM members_event_choice WHERE event_id = '${event_id}' AND user_id = '${interaction_user_id}'`, async (err, veryall) => {
                
                if (veryall.length < 1) {
                    interaction.deferUpdate()
                }

                SoraBot.db.query(`DELETE FROM members_event_choice WHERE event_id = '${event_id}' AND user_id = '${interaction_user_id}'`, async (err, all) => {


                    SoraBot.db.query(`SELECT guild_nickname, choice_name FROM members_event_choice WHERE event_id = '${event_id}'`, (err, req) => {


                        for (let i = 0; i < req.length; i++) {
                            if (req[i].choice_name == 'Participant') {
                                participants.push('\n - ' + req[i].guild_nickname)
                            } else if (req[i].choice_name == 'Indécis') {
                                indecis.push('\n - ' + req[i].guild_nickname)
                            } else if (req[i].choice_name == 'Réserviste') {
                                reservistes.push('\n - ' + req[i].guild_nickname)
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
                            .setTitle(event_title)
                            .setDescription(event_description)
                            .setThumbnail(SoraBot.user.displayAvatarURL({ dynamic: true }))
                            .addFields(
                                { name: 'Date et heure', value: receivedembed.fields[0].value },
                            )
                            .addFields(
                                { name: '\u200B', value: '\u200B' },
                                { name: '✅ Participants', value: `${participants}`, inline: true},
                                { name: '❓Indécis', value: `${indecis}`, inline: true },
                                { name: '🪑 Réservistes', value: `${reservistes}`, inline: true },
                            )
                            .setImage('https://i.stack.imgur.com/Fzh0w.png')
                            .setFooter(receivedembed.footer)

                        interaction.message.edit({ embeds: [embed] });
                    })
                })
                
            })
            await interaction.deferUpdate()


        }

    }

}