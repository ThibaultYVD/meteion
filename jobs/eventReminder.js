async function eventReminderInterval(client, channel) {
    setInterval(() => {
        const now = new Date();

        const sql = "SELECT * FROM events WHERE rappelMessageId = 'Null' AND epoch_timestamp < UNIX_TIMESTAMP(NOW()) + 3600"
        client.db.query(sql, async (req, events) => {
            if (events.length !== 0) {

                // Parcourez la liste des evenst
                for (const event of events) {
                    console.log(event)

                    let channel = client.channels.cache.get(event.channel_id);

                    const messageSent = await channel.send(`## 📝 L'événement "${event.event_title}" commence <t:${event.epoch_timestamp}:R> !\nMerci de prévenir en cas de retard ou d'absence !`);
                    console.log(messageSent.id)
                    client.db.query(`UPDATE events SET rappelMessageId='${messageSent.id}' WHERE event_id = '${event.event_id}'`)
                }
            }

        })

    }, 60000); // Vérifiez toutes les minutes (60000 millisecondes)
}

module.exports = { eventReminderInterval }
