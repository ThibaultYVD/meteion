const Discord = require("discord.js");

module.exports = {
    name: "event",
    description: "Créer un nouvel évenement.",
    permission: "Aucune",
    dm: false,
    category: "Evenement",
    options: [
        {
            type: "string",
            name: "titre",
            description: "Titre de l'évenement.",
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: "détails",
            description: "Détails de l'événement",
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: "date",
            description: "Date où aura lieu l'évenement.",
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: "heure",
            description: "Heure où aura lieu l'évenement.",
            required: true,
            autocomplete: false
        }
    ],

    async run(SoraBot, message, args, db) {

        let event_id = message.id

        // Variables guilds
        let message_guild_id = message.guild.id;
        let message_guild_name = message.guild.name;
        let message_guild_total_members = message.guild.memberCount;

        //Variable user quand création d'un event
        let event_creator_id = message.user.id
        let event_creator_tag = message.user.tag
        let event_creator_nickname = message.member.nickname
        let event_creator_guild_id = message.member.guild.id;
        let event_creator_guild_name = message.member.guild.name;

        // Variables event
        let titre = args.getString("titre")
        let description = args.getString("détails")
        let date = args.getString("date")
        let heure = args.getString("heure")


        // Ajout du serveur ou actualisation dans la base de données
        db.query(`SELECT * FROM guilds WHERE guild_id = '${message_guild_id}'`, function (err, row) {
            if (row && row.length) {
                db.query(`UPDATE guilds SET guild_name = '${message_guild_name}', guild_total_members = ${message_guild_total_members} WHERE guild_id = '${message_guild_id}'`)
            } else {
                db.query(`INSERT INTO guilds (guild_id, guild_name, guild_total_members) VALUE ('${message_guild_id}', '${message_guild_name}', ${message_guild_total_members})`)
            }
        })

        // Ajout de l'utilisateur qui a créé l'event dans la bdd
        db.query(`SELECT * FROM users WHERE user_id = '${event_creator_id}'`, function (err, row) {
            if (row && row.length) {
                db.query(`UPDATE users SET user_tag = '${event_creator_tag}' WHERE user_id = ${event_creator_id}`)
            } else {
                db.query(`INSERT INTO users (user_id, user_tag) VALUE ('${event_creator_id}', '${event_creator_tag}')`)
            }
        })

        // Ajout du membre qui a créé l'event dans la bdd
        db.query(`SELECT * FROM guild_members WHERE user_id = '${event_creator_id}'`, function (err, row) {
            if (row && row.length) {
                db.query(`UPDATE guild_members SET user_tag = '${event_creator_tag}', nickname = '${event_creator_nickname}', guild_name = '${event_creator_guild_name}' WHERE user_id = '${event_creator_id}'`)
            } else {
                db.query(`INSERT INTO guild_members (user_id, user_tag, guild_name, nickname) VALUE ('${event_creator_id}', '${event_creator_tag}', '${event_creator_guild_name}', '${event_creator_nickname}')`)
            }
        })

        // Ajout de l'event dans la base de données
        db.query(`INSERT INTO events(event_id, guild_name, event_title, event_description, event_date, event_hour) VALUES ('${event_id}', '${message_guild_name}','${titre}','${description}','${date}','${heure}')`)





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
                text: `Proposé par : ${message.member.nickname}`,
                iconURL: message.user.displayAvatarURL({ dynamic: false }),
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
                    .setEmoji('⚙️')
                    .setStyle(Discord.ButtonStyle.Secondary),
            );



        await message.reply({ embeds: [embed], components: [row] })
    }
}