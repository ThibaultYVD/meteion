const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../models/Models');
const errorEmbed = require('../utils/errorEmbed');

module.exports = {
	customId: 'eventCreationModal',
	async execute(interaction) {
		const client = interaction?.client;
		try {
			const username = interaction.member.nickname || interaction.user.globalName;

			const titre = interaction.fields.getTextInputValue('eventTitle');
			const description = interaction.fields.getTextInputValue('eventDesc');
			const date = interaction.fields.getTextInputValue('eventDate');
			const heure = interaction.fields.getTextInputValue('eventHour');
			let place = interaction.fields.getTextInputValue('eventPlace');

			if (place === '' || place === null) place = client.i18next.t('event.info.bot.not_specified_location');

			if (!isValidDateTime(date, heure)) {
				return interaction.reply({
					content: client.i18next.t('event.error.date_format_error'),
					ephemeral: true,
				});
			}

			const epochTimestamp = Math.floor(
				Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}:00`) / 1000,
			);

			if (isNaN(epochTimestamp)) {
				return interaction.reply({
					content: client.i18next.t('event.error.date_format_error'),
					ephemeral: true,
				});
			}

			const now = new Date();
			now.setSeconds(0, 0);

			if (epochTimestamp * 1000 < now.getTime()) {
				return interaction.reply({
					content: client.i18next.t('event.error.previous_date_error'),
					ephemeral: true,
				});
			}

			const embed = createEventEmbed(client, interaction, username, titre, description, date, heure, place);
			const rows = getEventEmbedRows(client);

			const nativeDiscordEventDescription = client.i18next.t('event.info.native_discord.description', {
				description: description,
			});

			const eventDateTime = new Date(`${formatEventDate(date)} ${formatEventHour(heure)}:00`);

			const scheduledStartTime = new Date(eventDateTime);
			const scheduledEndTime = new Date(eventDateTime.getTime() + 3 * 60 * 60 * 1000);

			await interaction.guild.scheduledEvents.create({
				name: titre,
				scheduledStartTime: scheduledStartTime,
				scheduledEndTime: scheduledEndTime,
				privacyLevel: 2,
				entityType: 3,
				description: nativeDiscordEventDescription,
				entityMetadata: { location: place },
			});

			const reply = await interaction.reply({
				embeds: [embed],
				components: rows.map(row => row.toJSON()),
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
				embeds: [errorEmbed(client, client.i18next.t('event.error.error_occured'))],
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
			{ name: client.i18next.t('event.info.bot.embed_labels.time') + '\u200B'.repeat(10), value: formatEventDateHeureValue(date, heure), inline: true },
			{ name: client.i18next.t('event.info.bot.embed_labels.meeting_place'), value: `*${place}*`, inline: true },
			{ name: '\u200B', value: '\u200B' },
			{
				name: client.i18next.t('event.info.bot.embed_labels.participant', {
					number: 0,
				}), value: '\u200B', inline: true,
			},
			{
				name: client.i18next.t('event.info.bot.embed_labels.undecided', {
					number: 0,
				}), value: '\u200B', inline: true,
			},
			{
				name: client.i18next.t('event.info.bot.embed_labels.in_reserve', {
					number: 0,
				}), value: '\u200B', inline: true,
			},
			{
				name: client.i18next.t('event.info.bot.embed_labels.absent', {
					number: 0,
				}), value: '\u200B', inline: true,
			},
			{ name: '\u200B', value: '\u200B' },
		)
		.setFooter({
			text: client.i18next.t('event.info.bot.embed_labels.created_by', {
				username: username,
			}),
			iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
		});
	return embed;
}

function getEventEmbedRows(client) {
	return [
		new ActionRowBuilder().addComponents(
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
		),
		new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('absent')
				.setLabel('❌')
				.setStyle(ButtonStyle.Secondary),
		),
		new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('eventEdit')
				.setLabel(client.i18next.t('event.info.bot.buttons_labels.edit'))
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('eventDelete')
				.setLabel(client.i18next.t('event.info.bot.buttons_labels.delete'))
				.setStyle(ButtonStyle.Danger),
		),
	];
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
