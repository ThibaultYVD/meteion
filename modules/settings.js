const { getSettingsEmbed } = require("./embeds");
const { PermissionsBitField } = require('discord.js');

function toggleSettingValue(client, interaction, settingFieldIndex, dbColumn) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        interaction.reply({ content: `Seuls les administrateurs du serveur peuvent changer ces valeurs.`, ephemeral: true })
    }
    else {
        let closeEventValue = interaction.message.embeds[0].fields[1].value;
        let eventReminderValue = interaction.message.embeds[0].fields[2].value;
        let embed

        // Déterminez quelle valeur basculer en fonction du champ spécifié
        let currentValue = settingFieldIndex === 1 ? closeEventValue : eventReminderValue;


        // Basculer entre "✅ Activé" et "❌ Désactivé"
        let newValue = currentValue === "✅ Activé" ? "❌ Désactivé" : "✅ Activé";


        // Mettez à jour la base de données avec la nouvelle valeur
        client.db.query(`UPDATE guilds SET ${dbColumn} = '${newValue}' WHERE guild_id = '${interaction.message.guild.id}'`);

        switch (dbColumn) {
            case "close_event_value":
                embed = getSettingsEmbed(client, newValue, eventReminderValue);
                break;
            case "event_reminder_value":
                embed = getSettingsEmbed(client, closeEventValue, newValue);
                break;
            default:
                break;

        }

        // Mettez à jour l'embed du message
        interaction.message.edit({ embeds: [embed] });
        interaction.deferUpdate();
    }
}

module.exports = { toggleSettingValue }
