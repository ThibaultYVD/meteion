const { getEventCreationModal } = require("../modules/modals");
const { createInfoLog, createWarnLog, createErrorLog } = require("../modules/logs")

module.exports = {
    name: "event",
    description: "Créer un nouvel évenement.",
    permission: "Aucune",
    dm: false,
    category: "Evénements",


    async run(client, message, args, db) {
        try {
            // Ajout du serveur ou actualisation dans la base de données
            client.db.query(`SELECT * FROM guilds WHERE guild_id = '${message.guild.id}'`, function (req, res) {
                console.log(db)
                if (res.length != 0) {
                    client.db.query(`UPDATE guilds SET guild_name = '${message.guild.name}', guild_total_members = ${message.guild.memberCount}, activeChannel = '${message.channel.id}' WHERE guild_id = '${message.guild.id}'`)
                } else {
                    client.db.query(`INSERT INTO guilds (guild_id, guild_name, guild_total_members, close_event_value, event_reminder_value, activeChannel) VALUE ('${message.guild.id}', '${message.guild.name}', ${message.guild.memberCount}, '✅ Activé', '✅ Activé', '${message.channel.id}')`)
                }
            })

            // Ajout de l'utilisateur qui a créé l'event dans la bdd
            client.db.query(`SELECT * FROM users WHERE user_id = '${message.user.id}'`, function (req, res) {
                if (res.length != 0) {
                    client.db.query(`UPDATE users SET user_tag = '${message.user.tag}' WHERE user_id = ${message.user.id}`)
                } else {
                    client.db.query(`INSERT INTO users (user_id, user_tag) VALUE ('${message.user.id}', '${message.user.tag}')`)
                }
            })

            // Ajout du membre qui a créé l'event dans la bdd
            client.db.query(`SELECT * FROM guild_members WHERE user_id = '${message.user.id}'`, function (req, res) {
                if (res.length != 0) {
                    client.db.query(`UPDATE guild_members SET user_tag = '${message.user.tag}', nickname = "${message.member.nickname}", guild_name = '${message.member.guild.name}' WHERE user_id = '${message.user.id}'`)
                } else {
                    client.db.query(`INSERT INTO guild_members (user_id, user_tag, guild_name, nickname) VALUE ('${message.user.id}', '${message.user.tag}', '${message.member.guild.name}', '${message.member.nickname}')`)
                }
            })

            createInfoLog(client, `La commande /event a été utilisé.`, "commands/event.js", message.user.id)

            // Show the modal to the user
            await message.showModal(getEventCreationModal());

        } catch (error) {
            console.log(error)
            createInfoLog(client, `La commande /event a été utilisé mais a échoué.`, "commands/event.js", message.user.id)
        }
    }
}
