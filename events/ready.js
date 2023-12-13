const Discord = require("discord.js");
const loadSlashCommands = require("../config/loadSlashCommands");
const loadDB = require("../config/db")
const createEventReminderJob = require("../jobs/eventReminder")
const createCloseEventJob = require("../jobs/closeEvent")
const { createInfoLog, createWarnLog, createErrorLog } = require("../modules/logs")

module.exports = async (client) => {

    try {
        client.db = await loadDB()

        client.db.connect(function (err) {
            if (err) {
                console.log(err +
                    '\n/!\\ ERROR : Connexion à la base de données impossible. /!\\\nMerci de vérifier les variables de connexion dans le fichier .env.' +
                    `\nLe lancement de ${client.user.tag} a échoué.`)

                process.exit(0);
            }
            console.log('\nConnecté à la base de données MySQL.\n');


        }),
            await loadSlashCommands(client)

        // Lancement des jobs
        const eventReminderJob = createEventReminderJob(client);
        const closeEventJob = createCloseEventJob(client);
        eventReminderJob.start()
        closeEventJob.start()

        console.log(`\n${client.user.tag} est en ligne.`);
    } catch (error) {
        createErrorLog(client, `Le lancement du client a échoué.`, "events/ready.js", "null")
    }

}