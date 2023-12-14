const { CronJob } = require("cron");
const { archivingEvent } = require("../modules/cloturer-events")
const { getDate } = require("../modules/date")
const { createInfoLog, createWarnLog, createErrorLog } = require("../modules/logs")

module.exports = (client) => {
    const job = new CronJob(
        '1 0 * * 1', // Se lance tout les lundis à 00h01
        //'* * * * * *', // se lance toutes les secondes (TEST ONLY)
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
        client.db.query(`SELECT events.* FROM events JOIN guilds ON events.guild_id = guilds.guild_id WHERE events.epoch_timestamp < '${epoch_timestamp}' AND guilds.closeEventValue = '✅ Activé';`, function (req, res) {
            if (res.length === 0) return

            // Traiter chaque événement
            res.forEach((event) => {
                let { channel_id, event_id, event_creator, guild_id, event_title, event_description, event_date, event_hour, epoch_timestamp, rappelMessageId } = event;

                event_title = event_title.replace(/'/g, "''").slice(0, -2);
                event_description = event_description.replace(/'/g, "''").slice(0, -2);

                archivingEvent(client, event_id, guild_id, event_title, event_description, event_date, event_hour)

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


