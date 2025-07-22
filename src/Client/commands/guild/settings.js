const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { _guildSettingsService, _interactionService } = require('@services');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Ouvre les paramètres de Météion.')
		.setDescriptionLocalizations({
			'en-US': 'Open Meteion\'s settings.',
		})
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),


	async execute(interaction) {
		try {
			const { guild, user, member, client } = interaction;

			await _interactionService.handleUserAndGuildData({ guild, user, member });

			await _guildSettingsService.initializeGuildSettings(guild);

			const guildSettings = await _guildSettingsService.getGuildSettings(guild);

			await _guildSettingsService.upsertGuildMember(guild, user, member);

			await interaction.reply({
				embeds: [getSettingsEmbed(interaction, client, guildSettings)],
				components: [getSettingsRows()],
				ephemeral: true,
			});
		}
		catch (error) {
			console.error('Erreur dans la commande /settings:', error);
		}
	},
};

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

	return embed;
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

	return row;
}