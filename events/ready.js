const Discord = require("discord.js");
const loadSlashCommands = require("../config/loadSlashCommands");
const loadDB = require("../config/db")
//const { eventReminderInterval } = require("../jobs/eventReminder")
const createEventReminderJob = require("../jobs/eventReminder")

module.exports = async (client, channel) => {

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
        eventReminderJob.start()

        console.log(`\n${client.user.tag} est en ligne.`);
    } catch (error) {
        console.log(error)
    }

}