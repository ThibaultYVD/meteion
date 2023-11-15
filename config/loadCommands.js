const fs = require("fs");
module.exports = async (client) => {
  try {
    fs.readdirSync("./commands").filter((f) => f.endsWith(".js")).forEach(async (file) => {
      let command = require(`../commands/${file}`);
      if (!command.name || typeof command.name !== "string") throw new TypeError(`La commande ${file.slice(f, file.lenght - 3)} n'a pas de nom.`);
      client.commands.set(command.name, command)
      console.log(`- Commande ${file} chargée.`)
    });
  } catch (error) {
    console.log(error)
  }

};
