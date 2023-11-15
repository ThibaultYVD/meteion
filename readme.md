# Meteion

Météion is a NodeJs app with the DiscordJs module. This application is used to create and organise events with other people in Discord.

## Installation

This application isn't installable. The bot will be accessible via a public link later.

## Usage

To create a event, you need to use the following command in a Discord server's channel: "/event".
A modal appears to enter event information then, the application sends a embed in the channel.

To sign into an event, the user must click on the 3 choices (Participant, Indécis, Réserviste) under the message according to they choices. To unsign, the user must click on the "Se retirer" button.

The creator of the event can manage it by accessing the Admin Panel via the "Administration" button. The creator can edit the event informations or cancel the event.

When the event's time come, a reminder is sent 1 hour before the beginning of the event.


A second command, "/cloturer-anciens-event" is used to put the event that has been finished in archive and delete the according messages (event and reminder messages)