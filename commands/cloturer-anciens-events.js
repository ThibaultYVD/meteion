const Discord = require("discord.js");
const { getErrorEmbed } = require("../functions/embeds")
const { archivingEvent } = require("../functions/cloturer-events")

module.exports = {

    name: "cloturer-anciens-events",
    description: "Clôture les événements datant de la veille ou plus et supprime l'annonce.",
    permission: 'Aucune',
    dm: false,
    category: "Evénements",

    async run(client, message, args) {

        try {
            // Récupérer la date d'aujourd'hui au format MM/DD/YYYY
            const today = new Date();
            const yyyy = today.getFullYear();
            let mm = today.getMonth() + 1; // Les mois commencent à 0!
            let dd = today.getDate();

            if (dd < 10) dd = '0' + dd;
            if (mm < 10) mm = '0' + mm;

            const formattedToday = mm + '/' + dd + '/' + yyyy;
            const epoch_timestamp = Date.parse(formattedToday);

            // Récupérer les événements à clôturer
            client.db.query(`SELECT * FROM events WHERE epoch_timestamp < '${epoch_timestamp}' `, function (err, row) {

                if (row && row.length) {
                    let fail = 0;

                    // Traiter chaque événement
                    row.forEach((event) => {
                        let { channel_id, event_id, event_creator, guild_name, event_title, event_description, event_date, event_hour, epoch_timestamp, rappel, rappelMessageId } = event;

                        event_title = event_title.replace(/'/g, "''").slice(0, -2);
                        event_description = event_description.replace(/'/g, "''").slice(0, -2);

                        archivingEvent(client, event_id, guild_name, event_title, event_description, event_date, event_hour)


                        if (channel_id === message.channel.id) {

                            // Supprimer les messages liés à l'événement
                            const channel = message.channel;
                            channel.messages.delete(event_id);
                            if (rappelMessageId != "Null") {
                                channel.messages.delete(rappelMessageId);
                            }

                        } else {
                            fail++;
                        }
                    });

                    // Afficher le résultat du processus de clôture des événements
                    const total = row.length - fail;
                    const replyMessage = (total === 0) ? `Echec : Aucun event n'est à clôturer dans ce salon.` :
                        (total === 1) ? `${total} ancien événement a été clôturé et supprimé.` :
                            `${total} anciens événements ont été clôturés et supprimés.`;

                    message.reply({ content: `${replyMessage}\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                } else {
                    // Aucun événement à clôturer
                    message.reply({ content: `Aucun événement n'est à clôturer.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true });
                }
            });
        } catch (error) {
            message.reply({ embeds: [getErrorEmbed(error)] });
        }
    }
}

