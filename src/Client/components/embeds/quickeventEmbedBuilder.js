const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createEventEmbed(client, interaction, username, titre, epochTimestamp) {
	const embed = new EmbedBuilder()
		.setColor(client.color)
		.setTitle(titre)
		.addFields(
			{
				name: client.i18next.t('event.info.bot.embed_labels.time'),
				value: `<t:${epochTimestamp}:F>(*<t:${epochTimestamp}:R>*)`,
				inline: true,
			},
			{ name: '\u200B', value: '\u200B' },
			{
				name: client.i18next.t('event.info.bot.embed_labels.participant', { number: 0 }),
				value: '\u200B',
				inline: true,
			},
			{ name: '\u200B', value: '\u200B' },
		)
		.setFooter({
			text: client.i18next.t('event.info.bot.embed_labels.created_by', { username }),
			iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
		});

	return embed;
}

function getEventEmbedRows(client) {
	return [
		new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('participant').setLabel('✅').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('quickeventEdit')
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
