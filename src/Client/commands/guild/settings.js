const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { _guildSettingsService, _interactionService } = require('@services');
const { getSettingsEmbed, getSettingsRows } = require('@embeds/settingsEmbedBuilder');

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

			await _guildSettingsService.initializeGuildSettings(guild);

			const guildSettings = await _guildSettingsService.getGuildSettings(guild);

			const embed = getSettingsEmbed(interaction, client, guildSettings);
			const rows = getSettingsRows();

			await interaction.reply({
				embeds: embed,
				components: rows,
				ephemeral: true,
			});

			await _interactionService.handleUserAndGuildData({ guild, user, member });

			await _guildSettingsService.updateOrCreateGuildMember(guild, user, member);
		}
		catch (error) {
			console.error('Erreur dans la commande /settings:', error);
		}
	},
};

