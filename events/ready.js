const Discord = require("discord.js");
const loadSlashCommands = require("../config/loadSlashCommands");
const loadDB = require("../config/db")

module.exports = async (SoraBot) => {

    try {
        SoraBot.db = await loadDB()


        SoraBot.db.connect(function (err) {
            /*if (err) {
                console.log(err)
                console.log('\n/!\\ ERROR : Connexion à la base de données impossible. /!\\\nMerci de vérifier les variables de connexion dans le fichier .env.')
                console.log(`\nLe lancement de ${SoraBot.user.tag} à échouer.`);

                process.exit(0);
            }
            console.log('\nConnecté à la base de données MySQL.\n');
            */

        }),
            
        await loadSlashCommands(SoraBot)

        console.log(`\n${SoraBot.user.tag} est en ligne.`);
    } catch (error) {
        console.log(error)
    }

}