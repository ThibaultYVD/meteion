const { SlashCommandBuilder } = require('discord.js');
const { _interactionService } = require('@services');
const { getEventCreationModal } = require('@modals/builders/eventCreateModalBuilder');

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

			await _interactionService.handleUserAndGuildData({ guild, user, member });

			const modal = getEventCreationModal();
			await interaction.showModal(modal);
		}
		catch (error) {
			console.error(error);
		}

	},
};

