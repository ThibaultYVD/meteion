var CronJob = require('cron').CronJob;
const Discord = require("discord.js");

module.exports = async () => {
    var job = new CronJob(
        '* * * * * *',
        function (SoraBot) {

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
                db.query(`SELECT * FROM events WHERE epoch_timestamp < '${epoch_timestamp}' `, function (err, row) {
                    console.log(row)
                    if (row && row.length) {
                        let fail = 0;

                        // Traiter chaque événement
                        row.forEach((event) => {
                            const { channel_id, event_id, event_creator, guild_name, event_title, event_description, event_date, event_hour, epoch_timestamp, rappel, rappelMessageId } = event;



                            // Échapper les apostrophes dans le titre et la description
                            const correctedTitle = event_title.replace(/'/g, "''").slice(0, -2);
                            const correctedDesc = event_description.replace(/'/g, "''").slice(0, -2);


                            if (channel_id === message.channel.id) {

                                // Compter les participants, les indécis et les réservistes
                                db.query(`SELECT COUNT(*) AS participantCount FROM members_event_choice WHERE event_id = '${event_id}' AND choice_name = 'Participant'`, function (err, count0) {
                                    const participants = count0[0].participantCount;
                                    db.query(`SELECT COUNT(*) AS indécisCount FROM members_event_choice WHERE event_id = '${event_id}' AND choice_name = 'Indécis'`, function (err, count1) {
                                        const indécis = count1[0].indécisCount;
                                        db.query(`SELECT COUNT(*) AS RéservisteCount FROM members_event_choice WHERE event_id = '${event_id}' AND choice_name = 'Réserviste'`, function (err, count2) {
                                            const reservistes = count2[0].RéservisteCount;

                                            // Archiver l'événement
                                            SoraBot.db.query(`INSERT INTO events_archives (guild_name, event_title, event_description, event_date, event_hour, total_participant, total_indecis, total_reserviste) 
                                            VALUES ('${guild_name}','${correctedTitle}','${correctedDesc}','${event_date}','${event_hour}',${participants},${indécis},${reservistes})`);

                                            // Supprimer l'événement de la table events
                                            db.query(`DELETE FROM events WHERE event_id = ${event_id}`);

                                            // Supprimer les choix de membres associés à l'événement
                                            db.query(`DELETE FROM members_event_choice WHERE event_id = ${event_id}`);
                                        });
                                    });
                                });

                                // Supprimer les messages liés à l'événement
                                const channel = message.channel;
                                //channel.messages.delete(event_id);
                                channel.messages.delete(rappelMessageId);
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
                // Gestion des erreurs
                const errEmbed = new Discord.EmbedBuilder()
                    .setTitle("New Error")
                    .setColor("#FF0000")
                    .setDescription(`An error just occurred!\n\nERROR:\n\n\`\`\`${error}\`\`\``)
                    .setTimestamp()
                    .setFooter("Anti-Crash System");

                message.reply({ embeds: [errEmbed] });
            }


        },

        null,
        true,
        'America/Los_Angeles'

    );
    job.start()
}
