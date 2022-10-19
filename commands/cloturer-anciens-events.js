const Discord = require("discord.js");

module.exports = {
    name: "cloturer-anciens-events",
    description: "Clôture les anciens événements et supprime l'annonce.",
    permission: 'Aucune',
    dm: false,
    category: "Evénements",

    async run(SoraBot, message, args) {

        //if(!channel) channel = message.channel;

        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        let hh = today.getHours();
        let min = today.getMinutes();

        
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;


        const formattedToday = dd + '/' + mm + '/' + yyyy;
        const formattedTime = hh + "h" + min;

        SoraBot.db.query(`SELECT * FROM events WHERE event_date <= '${formattedToday}' AND event_hour <='${formattedTime}' `, function (err, row) {
            if (row && row.length) {
                let i
                for (i = 0; i < row.length; i++) {

                    let guild_name = row[i].guild_name;
                    let event_title = row[i].event_title
                    let event_description = row[i].event_description
                    let event_date = row[i].event_date
                    let event_hour = row[i].event_hour

                    let eventid = row[i].event_id

                    SoraBot.db.query(`SELECT COUNT(*) AS participantCount FROM members_event_choice WHERE event_id = '${eventid}' AND choice_name = 'Participant'`, function (err, count0) {

                        let participants = count0[0].participantCount
                        SoraBot.db.query(`SELECT COUNT(*) AS indécisCount FROM members_event_choice WHERE event_id = '${eventid}' AND choice_name = 'Indécis'`, function (err, count1) {

                            let indécis = count1[0].indécisCount
                            SoraBot.db.query(`SELECT COUNT(*) AS RéservisteCount FROM members_event_choice WHERE event_id = '${eventid}' AND choice_name = 'Réserviste'`, function (err, count2) {

                                let reservistes = count2[0].RéservisteCount

                                SoraBot.db.query(`INSERT INTO events_archives (guild_name, event_title, event_description, event_date, event_hour, total_participant, total_indecis, total_reserviste) 
                                VALUES ('${guild_name}','${event_title}','${event_description}','${event_date}','${event_hour}',${participants},${indécis},${reservistes})`)

                                SoraBot.db.query(`DELETE FROM events WHERE event_id = ${eventid}`)
                                SoraBot.db.query(`DELETE FROM members_event_choice WHERE event_id = ${eventid}`)

                            })
                        })
                    })

                    channel = message.channel
                    channel.messages.delete(`${eventid}`)
                }
                if(i === 1){
                    message.reply({ content: `${i} ancien événement a été clôturé et supprimé.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true })
                }else{
                    message.reply({ content: `${i} anciens événements ont été clôturés et supprimés.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true })
                }
                
            } else {
                message.reply({ content: `Aucun événement n'est à clôturer.\n*Vous pouvez supprimer ce message. ⬇️*`, ephemeral: true })
            }
        })
    }

}