require("dotenv").config();
const { getBroadCastForm } = require("../modules/modals");
module.exports = {
    name: "broadcast",
    description: "Envoie un message à l'intégralité des serveurs",
    permission: "Aucune",
    dm: false,
    category: "Autre",




    run(client, message, args, db) {
        if (message.user.id != process.env.SUPERADMIN1) {
            message.reply({ content: `Cette commande est réservée au développeur de Météion.`, ephemeral: true });
            return

        } else {
            message.showModal(getBroadCastForm())
        }




    }
}