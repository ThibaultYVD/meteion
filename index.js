require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client({ intents: 3276799 });
const loadCommands = require("./config/loadCommands")
const loadEvents = require("./config/loadEvents")
const token = process.env.TOKEN
client.commands = new Discord.Collection()
client.color = "#684AF0";

client.login(token).then((token) => {
    client.user.setActivity('manipuler vos émotions');
});

loadCommands(client)
loadEvents(client)



const http = require('http');
const host = 'localhost'
const port = 2022;

const requestListener = function (req, res) {
    res.writeHead(200);
    res.end("Meteion Discord Bot");
};

const server = http.createServer(requestListener)

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});