const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createEventEmbed(client, interaction, username, titre, description, place, epochTimestamp) {
	const embed = new EmbedBuilder()
		.setColor(client.color)
		.setTitle(titre)
		.addFields(
			{ name: '\u200B', value: '\u200B' },
			{
				name: client.i18next.t('event.info.bot.embed_labels.time'),
				value: `<t:${epochTimestamp}:F>\n*<t:${epochTimestamp}:R>*`,
				inline: true,
			},
			{
				name: client.i18next.t('event.info.bot.embed_labels.meeting_place'),
				value: `*${place}*`,
				inline: true,
			},
			{ name: '\u200B', value: '\u200B' },
			{
				name: client.i18next.t('event.info.bot.embed_labels.participant', { number: 0 }),
				value: '\u200B',
				inline: true,
			},
			{
				name: client.i18next.t('event.info.bot.embed_labels.undecided', { number: 0 }),
				value: '\u200B',
				inline: true,
			},
			{
				name: client.i18next.t('event.info.bot.embed_labels.in_reserve', { number: 0 }),
				value: '\u200B',
				inline: true,
			},
			{
				name: client.i18next.t('event.info.bot.embed_labels.absent', { number: 0 }),
				value: '\u200B',
				inline: true,
			},
			{ name: '\u200B', value: '\u200B' },
		)
		.setFooter({
			text: client.i18next.t('event.info.bot.embed_labels.created_by', { username }),
			iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
		});

	if (description?.trim()) embed.setDescription(description);
	return embed;
}

function getEventEmbedRows(client) {
	return [
		new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('participant').setLabel('✅').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('indecis').setLabel('❓').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('reserviste').setLabel('🪑').setStyle(ButtonStyle.Secondary),
		),
		new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('absent').setLabel('❌').setStyle(ButtonStyle.Secondary),
		),
		new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('eventEdit')
				.setLabel(client.i18next.t('event.info.bot.buttons_labels.edit'))
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('eventDelete')
				.setLabel(client.i18next.t('event.info.bot.buttons_labels.delete'))
				.setStyle(ButtonStyle.Danger),
		),
	];
}

module.exports = {
	createEventEmbed,
	getEventEmbedRows,
};
