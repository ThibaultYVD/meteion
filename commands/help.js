const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

module.exports = {
    name: "help",
    description: "Obtenir des informations sur Météion",
    permission: "Aucune",
    dm: false,
    category: "Autre",

    async run(client, message, args, db) {
        message.reply(`Vous pourrez tout savoir sur le fonctionnement de l'application ici !\nhttps://sorasilver.notion.site/Guide-de-fonctionnement-9fac1708c59642f785bc8226b3efea19?pvs=4`)
    }
}