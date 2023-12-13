const { CronJob } = require("cron");
const { archivingEvent } = require("../modules/cloturer-events")
const { getDate } = require("../modules/date")
const { createInfoLog, createWarnLog, createErrorLog } = require("../modules/logs")

module.exports = (client) => {
    const job = new CronJob(
        '1 0 * * 1', // Se lance tout les lundis à 00h01
        () => closeEvent(client), // onTick (utilise une fonction anonyme pour passer le client)
        null, // onComplete
        false, // start
        'Europe/Paris' // timeZone
    );
    return job;
};


async function closeEvent(client) {
    try {
        let epoch_timestamp = Date.parse(getDate());
        epoch_timestamp = epoch_timestamp.toString().slice(0, -3);


        // Récupérer les événements à clôturer
        client.db.query(`SELECT * FROM events WHERE epoch_timestamp < '${epoch_timestamp}' `, function (req, res) {
            if (res.length === 0) return

            // Traiter chaque événement
            res.forEach((event) => {
                let { channel_id, event_id, event_creator, guild_name, event_title, event_description, event_date, event_hour, epoch_timestamp, rappelMessageId } = event;

                event_title = event_title.replace(/'/g, "''").slice(0, -2);
                event_description = event_description.replace(/'/g, "''").slice(0, -2);

                archivingEvent(client, event_id, guild_name, event_title, event_description, event_date, event_hour)

                let channel = client.channels.cache.get(channel_id);

                // Supprimer les messages liés à l'événement
                channel.messages.delete(event_id);
                if (rappelMessageId != "Null") {
                    channel.messages.delete(rappelMessageId);
                }
            });
        });

        createInfoLog(client, `Le job closeEvent a été exécuté avec succès.`, "jobs/closeEvent.js", "null")
    } catch (error) {
        createErrorLog(client, `Le job closeEvent a échoué.`, "jobs/closeEvent.js", "null")
    }
}


