const fs = require("fs");

module.exports = async (client) => {
  try {
    fs.readdirSync("./events").filter(f => f.endsWith(".js")).forEach(async (file) => {
      let event = require(`../events/${file}`);
      client.on(file.split(".js").join(""), event.bind(null, client))

      // Pour voir quel event fout la merde
      // console.log(event.bind)
      
      console.log(`- Event ${file} chargé.`)
    })
  } catch (error) {
    console.log(error)
  }
  
}
