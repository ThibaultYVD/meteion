const { SlashCommandBuilder } = require('discord.js');
const { _interactionService, _dateTimeService, _eventService } = require('@services');
const { _errorService, ErrorCodes } = require('@services/ErrorService');
const { createEventEmbed, getEventEmbedRows } = require('@embeds/quickeventEmbedBuilder');

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
		),

	async execute(interaction) {
		const client = interaction.client;

		try {
			const { guild, user, member, options } = interaction;

			const parsedDate = _dateTimeService.parseNaturalDate(options.getString('datetime'));
			if (!parsedDate) {
				throw _errorService.createError(ErrorCodes.INVALID_NATURAL_DATE_PARSE);
			}

			await interaction.deferReply();

			await _interactionService.handleUserAndGuildData({ guild, user, member });

			const title = options.getString('titre');
			const username = member.nickname || user.globalName;

			const { epochTimestamp, discordEventId, metadata } = await _eventService.createEvent({
				interaction,
				title,
				description: '',
				date: parsedDate.date,
				hour: parsedDate.hour,
				place: client.i18next.t('event.info.bot.not_specified_location'),
			});

			const embed = createEventEmbed(client, interaction, username, title, epochTimestamp);
			const rows = getEventEmbedRows(client);

			const reply = await interaction.editReply({
				embeds: [embed],
				components: rows.map(r => r.toJSON()),
			});

			await _eventService.persistEvent({ reply, interaction, metadata, epochTimestamp, discordEventId });
		}
		catch (error) {
			await _errorService.reply(interaction, error);
		}
	},
};
