const { SlashCommandBuilder } = require('discord.js');
const { _interactionService, _dateTimeService, _eventService } = require('@services');
const { createEventEmbed, getEventEmbedRows } = require('@embeds/quickeventEmbedBuilder');
const { _errorService } = require('@services/ErrorService');

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
			.setName('date')
			.setDescription('Date de l\'événement (DD/MM/YYYY ou langage naturel)')
			.setRequired(true)
		),

	async execute(interaction) {
		const client = interaction.client;

		try {
			const { guild, user, member, options } = interaction;

			await interaction.deferReply();

			await _interactionService.handleUserAndGuildData({ guild, user, member });

			const parsedDate = _dateTimeService.parseNaturalDate(options.getString('date'));
			if (!parsedDate) {
				await interaction.editReply({ content: 'Date invalide. Essaie "demain à 14h" ou "dans 2h".' });
				return;
			}

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
			await _errorService.reply(interaction, client, error);
		}
	},
};
