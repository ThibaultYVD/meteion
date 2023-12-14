const { createInfoLog, createWarnLog, createErrorLog } = require("./logs")

function archivingEvent(client, eventId, guildId, title, description, date, heure) {
    try {
        // Compter les participants, les indécis et les réservistes
        client.db.query(`SELECT COUNT(*) AS participantCount FROM members_event_choice WHERE event_id = '${eventId}' AND choice_name = 'Participant'`, function (err, count0) {
            const participants = count0[0].participantCount;
            client.db.query(`SELECT COUNT(*) AS indécisCount FROM members_event_choice WHERE event_id = '${eventId}' AND choice_name = 'Indécis'`, function (err, count1) {
                const indécis = count1[0].indécisCount;
                client.db.query(`SELECT COUNT(*) AS RéservisteCount FROM members_event_choice WHERE event_id = '${eventId}' AND choice_name = 'Réserviste'`, function (err, count2) {
                    const reservistes = count2[0].RéservisteCount;

                    // Archiver l'événement
                    client.db.query(`INSERT INTO events_archives (guild_id, event_title, event_description, event_date, event_hour, total_participant, total_indecis, total_reserviste) 
                VALUES ('${guildId}','${title}','${description}','${date}','${heure}',${participants},${indécis},${reservistes})`);

                    // Supprimer l'événement de la table events
                    client.db.query(`DELETE FROM events WHERE event_id = ${eventId}`);

                    // Supprimer les choix de membres associés à l'événement
                    client.db.query(`DELETE FROM members_event_choice WHERE event_id = ${eventId}`);
                });
            });
        });

        createInfoLog(client, `L'event avec l'id ${eventId} a bien été archivé.`, "modules/cloturer-event.js", "null")
    } catch (error) {
        createErrorLog(client, `L'archivage de l'event avec l'id ${eventId} a échoué.`, "modules/cloturer-event.js", "null")
    }

}


module.exports = { archivingEvent }