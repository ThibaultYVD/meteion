const Discord = require("discord.js");
const { getSettingsEmbed, getSettingsRows } = require("../modules/embeds");
const { PermissionsBitField } = require('discord.js');
module.exports = {
    name: "settings",
    description: "Accéder aux paramètres de Météion.",
    permission: PermissionsBitField.Flags.Administrator,
    dm: false,
    category: "Autre",



    async run(client, message, args, db) {

        try {
            let closeEventValue
            let eventReminderValue

            // Ajout du serveur ou actualisation dans la base de données
            db.query(`SELECT * FROM guilds WHERE guild_id = '${message.guild.id}'`, function (err, row) {
                if (row && row.length) {
                    db.query(`UPDATE guilds SET guild_name = '${message.guild.name}', guild_total_members = ${message.guild.memberCount} WHERE guild_id = '${message.guild.id}'`)
                } else {
                    db.query(`INSERT INTO guilds (guild_id, guild_name, guild_total_members, closeEventValue, eventReminderValue) VALUE ('${message.guild.id}', '${message.guild.name}', ${message.guild.memberCount}, '✅ Activé', '✅ Activé')`)
                }
            })
            db.query(`SELECT closeEventValue, eventReminderValue FROM guilds WHERE guild_id = '${message.guild.id}'`, function (req, res) {
                if (res[0].closeEventValue === '') {
                    db.query(`UPDATE guilds SET closeEventValue = '✅ Activé', eventReminderValue = '✅ Activé' WHERE guild_id = '${message.guild.id}'`)
                    closeEventValue = '✅ Activé'
                    eventReminderValue = '✅ Activé'

                } else {
                    closeEventValue = res[0].closeEventValue
                    eventReminderValue = res[0].eventReminderValue
                }
                message.reply({
                    embeds: [getSettingsEmbed(client, closeEventValue, eventReminderValue)], components: [getSettingsRows()], ephemeral: false
                });
            })
            
        } catch (error) {
            console.log(error)
        }
    }
}