const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Liste les commandes disponibles.')
		.setDescriptionLocalizations({
			'en-US': 'List the available commands.',
		}),
	async execute(interaction) {
		// Créer l'embed
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

		// Créer le bouton
		const button = new ButtonBuilder()
			.setLabel('Discord')
			.setStyle(ButtonStyle.Link)
			.setURL('https://discord.gg/edY9fb7Dk8');

		// Ajouter le bouton à un ActionRow
		const row = new ActionRowBuilder().addComponents(button);

		// Répondre avec l'embed et le bouton
		await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
	},
};
