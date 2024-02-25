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
        let epochTimestamp = Date.parse(getDate());
        epochTimestamp = epochTimestamp.toString().slice(0, -3);


        // Récupérer les événements à clôturer
        client.db.query(`SELECT events.* FROM events JOIN guilds ON events.guild_id = guilds.guild_id WHERE events.epoch_timestamp < '${epochTimestamp}' AND guilds.close_event_value = '✅ Activé';`, function (req, res) {
            if (res.length === 0) {
                return
            } else {

                // Traiter chaque événement
                res.forEach((event) => {

                    let { channel_id, event_id, event_creator, guild_id, event_title, event_description, event_date, event_hour, epoch_timestamp, rappel_message_id } = event;

                    event_title = event_title.replace(/'/g, "''").slice(0, -2);
                    event_description = event_description.replace(/'/g, "''").slice(0, -2);

                    let channel = client.channels.cache.get(channel_id);
                    

                    archivingEvent(client, event_id, guild_id, event_title, event_description, event_date, event_hour)
                    
                    
                    // Supprimer les messages liés à l'événement
                    if (rappel_message_id != "Null") {
                        channel.messages.delete(rappel_message_id);
                    }
                    channel.messages.delete(event_id);

                });
            }
        });

        createInfoLog(client, `Le job closeEvent a été exécuté avec succès.`, "jobs/closeEvent.js", "null")
    } catch (error) {
        console.log(error)
        createErrorLog(client, `Le job closeEvent a échoué.`, "jobs/closeEvent.js", "null")
    }
}


