require("dotenv").config();
const Discord = require("discord.js");
const SoraBot = new Discord.Client({ intents: 3276799 });
const loadCommands = require("./config/loadCommands")
const loadEvents = require("./config/loadEvents")
const token = process.env.TOKEN
SoraBot.commands = new Discord.Collection()
SoraBot.color = "#684AF0";

SoraBot.login(token).then((token) => {
    SoraBot.user.setActivity('manipuler vos émotions');
});

loadCommands(SoraBot)
loadEvents(SoraBot)