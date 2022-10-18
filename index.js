require("dotenv").config();
const Discord = require("discord.js");
const SoraBot = new Discord.Client({intents : 3276799});
const loadCommands = require("./config/loadCommands")
const loadEvents = require("./config/loadEvents")

SoraBot.commands = new Discord.Collection()
SoraBot.color = "#684AF0";
SoraBot.login(process.env.TOKEN);

loadCommands(SoraBot)
loadEvents(SoraBot)