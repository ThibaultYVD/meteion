const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../models/Models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('Créer un nouvel évenement.')
		.setDescriptionLocalizations({
			'en-US': 'Create a new event.',
		}),

	async execute(interaction) {
		try {
			const { guild, user, member } = interaction;

			// INFO: Met à jour les infos du serveur et de l'utilisateur à l'utilisation de la commande

			await Promise.all([
				db.Guild.upsert({
					guild_id: guild.id,
					guild_name: guild.name,
					guild_total_members: guild.memberCount,
				}),
				db.User.upsert({
					user_id: user.id,
					username: user.username,
					global_name: user.globalName,
					added_date: new Date(),
				}),
				db.GuildMember.upsert({
					guild_id: guild.id,
					user_id: user.id,
					user_nickname: member.nickname,
					last_bot_interaction: new Date(),
				}),
			]);

			await interaction.showModal(getEventCreationModal());
		}
		catch (error) {
			console.error(error);
		}

	},
};

function getCurrentDate() {
	const currentDate = new Date();
	const day = String(currentDate.getDate()).padStart(2, '0');
	const month = String(currentDate.getMonth() + 1).padStart(2, '0');
	const year = currentDate.getFullYear();
	return formattedDate = `${day}/${month}/${year}`;
}

function getCurrentHour() {
	const currentTime = new Date();
	const hours = currentTime.getHours() + 1;
	return formattedHour = `${String(hours).padStart(2, '0')}h00`;
}

function getEventCreationModal() {
	const modal = new ModalBuilder()
		.setCustomId('eventCreationModal')
		.setTitle('Création d\'un événement.');


	const eventTitleInput = new TextInputBuilder()
		.setCustomId('eventTitle')
		.setLabel('Titre.')
		.setStyle(TextInputStyle.Short)
		.setMaxLength(100)
		.setRequired(true)
		.setValue('Exemple titre');

	const eventDescInput = new TextInputBuilder()
		.setCustomId('eventDesc')
		.setLabel('Description et/ou détails.')
		.setMaxLength(400)
		.setRequired(false)
		.setStyle(TextInputStyle.Paragraph)
		.setValue('Exemple description');


	const dateInput = new TextInputBuilder()
		.setCustomId('eventDate')
		.setLabel('Date de l\'événement.')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder(getCurrentDate())
		.setMaxLength(10)
		.setRequired(true)
		.setValue(getCurrentDate());

	const hourInput = new TextInputBuilder()
		.setCustomId('eventHour')
		.setLabel('Heure de l\'événement.')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder(getCurrentHour())
		.setMaxLength(5)
		.setRequired(true)
		.setValue(getCurrentHour());


	const eventPlaceInput = new TextInputBuilder()
		.setCustomId('eventPlace')
		.setLabel('Lieu de rassemblement')
		.setMaxLength(100)
		.setStyle(TextInputStyle.Short)
		.setRequired(false)
		.setValue('Exemple Lieu de rassemblement');

	modal.addComponents(
		new ActionRowBuilder().addComponents(eventTitleInput),
		new ActionRowBuilder().addComponents(eventDescInput),
		new ActionRowBuilder().addComponents(dateInput),
		new ActionRowBuilder().addComponents(hourInput),
		new ActionRowBuilder().addComponents(eventPlaceInput),
	);
	return modal;
}
