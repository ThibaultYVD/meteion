const { getEventCreationModal } = require("../functions/modals");

module.exports = {
    name: "event",
    description: "Créer un nouvel évenement.",
    permission: "Aucune",
    dm: false,
    category: "Evénements",


    async run(client, message, args, db) {
        try {
            // Variables guilds
            let message_guild_id = message.guild.id;
            let message_guild_name = message.guild.name;
            let message_guild_total_members = message.guild.memberCount;

            //Variable user quand création d'un event
            let event_creator_id = message.user.id
            let event_creator_tag = message.user.tag
            let event_creator_nickname = message
            let event_creator_guild_id = message.member.guild.id;
            let event_creator_guild_name = message.member.guild.name;



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

            // Show the modal to the user
            await message.showModal(getEventCreationModal());

        } catch (error) {
            console.log(error)
        }


    }
}