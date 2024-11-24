const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../models/Models');

module.exports = {
	customId: 'eventCreationModal',
	async execute(interaction) {
		try {
			const client = interaction.client;

			const username = interaction.member.nickname || interaction.user.globalName;

			const titre = interaction.fields.getTextInputValue('eventTitle');
			const description = interaction.fields.getTextInputValue('eventDesc');
			const date = interaction.fields.getTextInputValue('eventDate');
			const heure = interaction.fields.getTextInputValue('eventHour');
			let place = interaction.fields.getTextInputValue('eventPlace');

			if (place === '' || place === null) place = 'Non renseigné';

			if (!isValidDateTime(date, heure)) {
				return interaction.reply({
					content: 'Erreur(s) au niveau de la **date** et/ou de **l\'heure**. Merci de respecter le format.',
					ephemeral: true,
				});
			}

			const epochTimestamp = Math.floor(Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`) / 1000);
			if (isNaN(epochTimestamp)) {
				return interaction.reply({
					content: 'Erreur au niveau de la **date** et/ou de **l\'heure**. Merci de respecter le format.',
					ephemeral: true,
				});
			}

			if (epochTimestamp * 1000 <= new Date()) {
				return interaction.reply({
					content: 'Date et heure invalide. Vous ne pouvez pas renseigner une date ou une heure antérieure à la date ou l\'heure actuelle.',
					ephemeral: true,
				});
			}

			const embed = createEventEmbed(client, interaction, username, titre, description, date, heure, place);
			const reply = await interaction.reply({
				embeds: [embed],
				components: [getEventEmbedRows()],
				fetchReply: true,
			});

			await db.Event.create({
				event_id: reply.id,
				guild_id: reply.guildId,
				channel_id: reply.channelId,
				user_id: reply.interaction.user.id,
				event_title: titre,
				event_description: description,
				event_date_string: date,
				event_hour_string: heure,
				event_date_hour_timestamp: epochTimestamp.toString(),
				event_status: 'planned',
				event_place: place,
				created_at: new Date(),
			});


		}
		catch (error) {
			console.error('Erreur lors de la gestion du modal :', error);
			return await interaction.reply({
				content: 'Une erreur est survenue lors de la création de l\'événement.',
				ephemeral: true,
			});
		}
	},
};


function isValidDateTime(date, heure) {
	const isValidDate = /^\d{2}\/\d{2}\/\d{4}$/.test(date);
	const isValidHour = /^\d{2}h\d{2}$/.test(heure);
	return isValidDate && isValidHour;
}

function formatEventDate(date) {
	const [day, month, year] = date.split('/');
	return `${year}-${month}-${day}`;
}

function formatEventHour(hour) {
	return hour.replace('h', ':');
}

function createEventEmbed(client, interaction, username, titre, description, date, heure, place) {
	const embed = new EmbedBuilder()
		.setColor(client.color)
		.setTitle(`${titre}`)
		.setDescription(`${description}`)
		.addFields(
			{ name: '\u200B', value: '\u200B' },
			{ name: '📅 Temps' + '\u200B'.repeat(10), value: formatEventDateHeureValue(date, heure), inline: true },
			{ name: '📍Lieu de rassemblement', value: `*${place}*`, inline: true },
			{ name: '\u200B', value: '\u200B' },
			{ name: '✅ Participants (0)', value: '\u200B', inline: true },
			{ name: '❓Indécis (0)', value: '\u200B', inline: true },
			{ name: '🪑 En réserve (0)', value: '\u200B', inline: true },
			{ name: '\u200B', value: '\u200B' },
		)
		.setFooter({
			text: `Créé par ${username}`,
			iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
		});
	return embed;
}

function getEventEmbedRows() {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('participant')
			.setLabel('✅')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('indecis')
			.setLabel('❓')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('reserviste')
			.setLabel('🪑')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('eventEdit')
			.setLabel('Modifier')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId('eventDelete')
			.setLabel('Supprimer')
			.setStyle(ButtonStyle.Danger),
	);
}

function formatEventDateHeureValue(date, heure) {
	try {
		const epochTimestamp = Math.floor(Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`) / 1000);
		return `<t:${epochTimestamp}:F>\n*<t:${epochTimestamp}:R>*`;
	}
	catch (error) {
		console.error('Erreur dans formatEventDateHeureValue:', error);
		return null;
	}
}
