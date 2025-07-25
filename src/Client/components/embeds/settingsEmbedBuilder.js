const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

function getSettingsEmbed(interaction, client, guildSettings) {
	const embed = new EmbedBuilder()
		.setColor(client.color)
		.setTitle(`Paramètres du serveur ${interaction.guild.name}`)
		.addFields(
			{ name: '📅 Paramètres des événements', value: '------------------------' },
		)
		.setImage('https://i.stack.imgur.com/Fzh0w.png')
		.setFooter({
			text: `${client.user.username}`,
			iconURL: client.user.displayAvatarURL({ dynamic: false }),
		});

	guildSettings.forEach(setting => {
		embed.addFields({
			name: `- ${setting.setting_display_name}`,
			value: setting.activation_status,
			inline: true,
		});
	});

	return [embed];
}

function getSettingsRows() {
	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('toggleCloseEvent')
				.setLabel('Changer Auto-suppression des événements')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId('toggleEventReminder')
				.setLabel('Changer Message de rappel')
				.setStyle(ButtonStyle.Secondary),
		);

	return [row];
}

module.exports = {
	getSettingsEmbed,
	getSettingsRows,
};