const Discord = require("discord.js");
const loadSlashCommands = require("../config/loadSlashCommands");
const loadDB = require("../config/db")

module.exports = async (SoraBot)=>{

    SoraBot.db = await loadDB()

    SoraBot.db.connect(function (){
        console.log("\nConnecté à la base de données.")
    })

    await loadSlashCommands(SoraBot)

    console.log(`\n${SoraBot.user.tag} est en ligne.`);
}