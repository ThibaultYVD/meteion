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
            client.db.query(`SELECT * FROM guilds WHERE guild_id = '${message.guild.id}'`, function (err, row) {
                if (row.length != 0) {
                    client.db.query(`UPDATE guilds SET guild_name = '${message.guild.name}', guild_total_members = ${message.guild.memberCount} WHERE guild_id = '${message.guild.id}'`)
                } else {
                    client.db.query(`INSERT INTO guilds (guild_id, guild_name, guild_total_members) VALUE ('${message.guild.id}', '${message.guild.name}', ${message.guild.memberCount})`)
                }
                client.db.query(`SELECT closeEventValue, eventReminderValue FROM guilds WHERE guild_id = '${message.guild.id}'`, function (req, res) {
                    closeEventValue = res[0].closeEventValue
                    eventReminderValue = res[0].eventReminderValue

                    message.reply({ embeds: [getSettingsEmbed(client, closeEventValue, eventReminderValue)], components: [getSettingsRows()], ephemeral: false });
                })
            })


        } catch (error) {
            console.log(error)
        }
    }
}