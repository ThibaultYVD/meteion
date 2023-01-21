const Discord = require("discord.js");

module.exports = {
    name: "dés",
    description: "Faire un jet de dés.",
    permission: "Aucune",
    dm: false,
    category: "Autre",
    options: [
        {
            type:"number",
            name:"nombre",
            description:"Nombre max du jet de dés",
            required: false,
        }
    ],



    async run(SoraBot, message, args, db) {

        let number = args.getNumber("nombre")

        if (number === null) number = 999
        var jetDes = Math.floor(Math.random() * number) + 1;
        message.reply(`Résultat du jet de dés : **${jetDes}**`);

    }
}