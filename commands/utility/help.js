const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Liste les commandes disponibles.')
		.setDescriptionLocalizations({
			'en-US': 'List the available commands.',
		}),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor(interaction.client.color)
			.setTitle('Centre d\'aide - Commandes')
			.addFields(
				{ name: '`/help`', value: '> Aide & Ressources' },
				{ name: '`/event`', value: '> Création d\'un événement' },
				{ name: '`/settings`', value: '> Paramètres du bot' },
				{ name: '\u200B', value: '\u200B' })
			.setFooter({
				text: 'Made with ❤️ by @sorasilver_',
				iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
			});

		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
};