const { CronJob } = require("cron");
const { createInfoLog, createWarnLog, createErrorLog } = require("../modules/logs")

module.exports = (client) => {
    const job = new CronJob(
        '* * * * * *', // se lance toutes les minutes
        () => eventReminder(client), // onTick (utilise une fonction anonyme pour passer le client)
        null, // onComplete
        false, // start
        'Europe/Paris' // timeZone
    );
    return job;
};

async function eventReminder(client) {
    try {
        const sql = "SELECT events.* FROM events JOIN guilds ON events.guild_id = guilds.guild_id WHERE rappel_message_id = 'Null' AND epoch_timestamp < UNIX_TIMESTAMP(NOW()) + 3600 AND guilds.event_reminder_value = '✅ Activé'";
        client.db.query(sql, async (req, events) => {
            
            if (events.length === 0) return

            // Parcourez la liste des événements
            for (const event of events) {
                let channel = client.channels.cache.get(event.channel_id);
                const messageSent = await channel.send(`## 📝 L'événement "${event.event_title}" commence <t:${event.epoch_timestamp}:R> !\nMerci de prévenir en cas de retard ou d'absence !`);
                client.db.query(`UPDATE events SET rappel_message_id='${messageSent.id}' WHERE event_id = '${event.event_id}'`);
            }
            createInfoLog(client, `Le job eventReminder a été exécuté avec succès.`, "jobs/eventReminder.js", "null")
        });

    } catch (error) {
        createErrorLog(client, `Le job eventReminder a échoué.`, "jobs/eventReminder.js", "null")
    }
}

