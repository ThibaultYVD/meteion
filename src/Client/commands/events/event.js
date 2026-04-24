const { SlashCommandBuilder } = require('discord.js');
const { _interactionService } = require('@services');
const { getEventCreationModal } = require('@modals/builders/eventCreateModalBuilder');
const pendingImages = require('@utils/pendingImages');
const pendingEventData = require('@utils/pendingEventData');

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('Créer un nouvel évenement.')
		.setDescriptionLocalizations({
			'en-US': 'Create a new event.',
		})
		.addAttachmentOption(option =>
			option
				.setName('image')
				.setDescription("Image d'illustration de l'événement (optionnelle).")
				.setRequired(false),
		),

	async execute(interaction) {
		try {
			const { guild, user, member } = interaction;
			await _interactionService.handleUserAndGuildData({ guild, user, member });

			const attachment = interaction.options.getAttachment('image');
			if (attachment) {
				if (!attachment.contentType?.startsWith('image/')) {
					return interaction.reply({
						content: 'Le fichier fourni n\'est pas une image valide.',
						ephemeral: true,
					});
				}
				if (attachment.size > MAX_IMAGE_SIZE) {
					return interaction.reply({
						content: 'L\'image ne doit pas dépasser 8 Mo.',
						ephemeral: true,
					});
				}
				pendingImages.set(user.id, {
					url: attachment.url,
					name: attachment.name,
					contentType: attachment.contentType,
				});
			}

			const prefillData = pendingEventData.get(user.id) ?? null;
			const modal = getEventCreationModal(prefillData);
			await interaction.showModal(modal);
		}
		catch (error) {
			console.error(error);
		}

	},
};

