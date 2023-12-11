function archivingEvent(client, event_id, guild_name, title, description, date, heure) {
    // Compter les participants, les indécis et les réservistes
    client.db.query(`SELECT COUNT(*) AS participantCount FROM members_event_choice WHERE event_id = '${event_id}' AND choice_name = 'Participant'`, function (err, count0) {
        const participants = count0[0].participantCount;
        client.db.query(`SELECT COUNT(*) AS indécisCount FROM members_event_choice WHERE event_id = '${event_id}' AND choice_name = 'Indécis'`, function (err, count1) {
            const indécis = count1[0].indécisCount;
            client.db.query(`SELECT COUNT(*) AS RéservisteCount FROM members_event_choice WHERE event_id = '${event_id}' AND choice_name = 'Réserviste'`, function (err, count2) {
                const reservistes = count2[0].RéservisteCount;

                // Archiver l'événement
                client.db.query(`INSERT INTO events_archives (guild_name, event_title, event_description, event_date, event_hour, total_participant, total_indecis, total_reserviste) 
                VALUES ('${guild_name}','${title}','${description}','${date}','${heure}',${participants},${indécis},${reservistes})`);

                // Supprimer l'événement de la table events
                client.db.query(`DELETE FROM events WHERE event_id = ${event_id}`);

                // Supprimer les choix de membres associés à l'événement
                client.db.query(`DELETE FROM members_event_choice WHERE event_id = ${event_id}`);
            });
        });
    });
}


module.exports = {archivingEvent}