const fs = require("fs");
module.exports = async (SoraBot) => {
  fs.readdirSync("./commands").filter((f) => f.endsWith(".js")).forEach(async (file) => {
      let command = require(`../commands/${file}`);
      if (!command.name || typeof command.name !== "string") throw new TypeError(`La commande ${file.slice(f, file.lenght - 3)} n'a pas de nom.`);
      SoraBot.commands.set(command.name,command)
      console.log(`- Commande ${file} chargée.`)
    });
};
