const crypto = require('node:crypto');
const { SlashCommandBuilder } = require('discord.js');
const { _interactionService, _dateTimeService, _eventService } = require('@services');
const { _errorService, ErrorCodes } = require('@services/ErrorService');
const { _eventImageRepository } = require('@repositories');
const { createEventEmbed, getEventEmbedRows } = require('@embeds/quickeventEmbedBuilder');
const pendingImages = require('@utils/pendingImages');

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quickevent')
		.setDescription('Créer rapidement un évenement en renseignant seulement le titre et la date.')
		.setDescriptionLocalizations({
			'en-US': 'Quickly create an event with just a title and date.',
		})
		.addStringOption(option => option
			.setName('titre')
			.setDescription('Titre de l\'événement')
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName('datetime')
			.setDescription('Date de l\'événement (DD/MM/YYYY hh:mm ou langage naturel)')
			.setRequired(true)
		)
		.addAttachmentOption(option =>
			option
				.setName('image')
				.setDescription("Image d'illustration de l'événement (optionnelle).")
				.setRequired(false),
		),

	async execute(interaction) {
		const client = interaction.client;

		try {
			const { guild, user, member, options } = interaction;

			const parsedDate = _dateTimeService.parseNaturalDate(options.getString('datetime'));
			if (!parsedDate) {
				throw _errorService.createError(ErrorCodes.INVALID_NATURAL_DATE_PARSE);
			}

			const attachment = options.getAttachment('image');
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

			await interaction.deferReply();

			await _interactionService.handleUserAndGuildData({ guild, user, member });

			const title = options.getString('titre');
			const username = member.nickname || user.globalName;

			const pendingImage = pendingImages.get(user.id);
			pendingImages.delete(user.id);

			let imageId = null;
			let imageUrl = null;
			let imageBuffer = null;

			if (pendingImage) {
				const response = await fetch(pendingImage.url);
				imageBuffer = Buffer.from(await response.arrayBuffer());
				imageId = crypto.randomUUID();
				await _eventImageRepository.create({
					image_id: imageId,
					image_data: imageBuffer,
					image_name: pendingImage.name,
					image_type: pendingImage.contentType,
					created_at: new Date(),
				});
				if (process.env.IMAGE_BASE_URL) imageUrl = `${process.env.IMAGE_BASE_URL}/v1/images/${imageId}`;
			}

			const { epochTimestamp, discordEventId, metadata } = await _eventService.createEvent({
				interaction,
				title,
				description: '',
				date: parsedDate.date,
				hour: parsedDate.hour,
				place: client.i18next.t('event.info.bot.not_specified_location'),
				imageBuffer,
			});

			const embed = createEventEmbed(client, interaction, username, title, epochTimestamp, imageUrl);
			const rows = getEventEmbedRows(client);

			const reply = await interaction.editReply({
				embeds: [embed],
				components: rows.map(r => r.toJSON()),
			});

			await _eventService.persistEvent({ reply, interaction, metadata, epochTimestamp, discordEventId, imageId });
		}
		catch (error) {
			await _errorService.reply(interaction, error);
		}
	},
};
