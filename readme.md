# Météion

Météion is a NodeJs app with the DiscordJs module. This application is used to create and organise events with other people in Discord.

## Installation for dev purposes

- Clone the repo : `git clone https://github.com/ThibaultYVD/meteion.git`.
- Fill the `.env.sample` and rename it to `.env`.
- Invite the bot to your discord server with the OAuth2 link generetad by checking "bot" and "applications.commands" in the `scope` section on the [Discord Developer Portal](https://discord.com/developers/applications).
- Start the bot by runnning the command `docker compose up --build -d`.
  
## Get the bot on your server

You must have a Discord account and have the authorization to add a Discord Application in the server.
The bot is accessible via this link : https://discord.com/api/oauth2/authorize?client_id=1029859620199616666&permissions=17620103457856&scope=bot%20applications.commands.

## Usage

To create a event, you need to use the following command in a Discord server's channel: "/event".
A modal appears to enter event information then, the application sends a embed in the channel.

To sign into an event, the user must click on the 3 choices (Participant, Indécis, En réserve) under the message according to they choices. To unsign, the user must click on the current choice button.

The creator of the event can manage it by the buttons "Modifer" and "Supprimer". The creator can edit the event informations or cancel the event.

- When a event's time come, a reminder is sent 1 hour before the beginning of the event.
- When a event begins, the reminder message is edited to announce the start.
- 3h after the hour of a event, the event is considered as finished. From then on, all interactions on the event are locked.
- Finally, a event message is deleted 3 days after its start.

The server's administrators can manage those behaviors via the /settings command.