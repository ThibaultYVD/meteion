const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { _interactionService, _dateTimeService } = require('@services');

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

			await interaction.showModal(await getEventCreationModal());

			await _interactionService.handleUserAndGuildData({ guild, user, member });
		}
		catch (error) {
			console.error(error);
		}

	},
};

async function getEventCreationModal() {
	const modal = new ModalBuilder()
		.setCustomId('eventCreationModal')
		.setTitle('Création d\'un événement.');

	const currentDate = await _dateTimeService.getCurrentDate();
	const currentHour = await _dateTimeService.getCurrentHour();

	const eventTitleInput = new TextInputBuilder()
		.setCustomId('eventTitle')
		.setLabel('Titre.')
		.setStyle(TextInputStyle.Short)
		.setMaxLength(100)
		.setRequired(true)
		.setValue('Exemple titre');

	const eventDescInput = new TextInputBuilder()
		.setCustomId('eventDesc')
		.setLabel('Description et/ou détails.')
		.setMaxLength(400)
		.setRequired(false)
		.setStyle(TextInputStyle.Paragraph)
		.setValue('Exemple description');

	const dateInput = new TextInputBuilder()
		.setCustomId('eventDate')
		.setLabel('Date de l\'événement.')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder(currentDate)
		.setMaxLength(10)
		.setRequired(true)
		.setValue(currentDate);

	const hourInput = new TextInputBuilder()
		.setCustomId('eventHour')
		.setLabel('Heure de l\'événement.')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder(currentHour)
		.setMaxLength(5)
		.setRequired(true)
		.setValue(currentHour);

	const eventPlaceInput = new TextInputBuilder()
		.setCustomId('eventPlace')
		.setLabel('Lieu de rassemblement')
		.setMaxLength(100)
		.setStyle(TextInputStyle.Short)
		.setRequired(false)
		.setValue('Exemple Lieu de rassemblement');

	modal.addComponents(
		new ActionRowBuilder().addComponents(eventTitleInput),
		new ActionRowBuilder().addComponents(eventDescInput),
		new ActionRowBuilder().addComponents(dateInput),
		new ActionRowBuilder().addComponents(hourInput),
		new ActionRowBuilder().addComponents(eventPlaceInput),
	);
	return modal;
}
