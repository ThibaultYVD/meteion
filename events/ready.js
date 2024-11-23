const Discord = require("discord.js");
const cron = require("node-cron")
const loadSlashCommands = require("../config/loadSlashCommands");
const loadDB = require("../config/db")

module.exports = async (SoraBot) => {

    try {
        SoraBot.db = await loadDB()


        SoraBot.db.connect(function () {
            console.log("\nConnecté à la base de données.")
        })

        await loadSlashCommands(SoraBot)

        console.log(`\n${SoraBot.user.tag} est en ligne.`);
    } catch (error) {
        console.log(error)
    }

}