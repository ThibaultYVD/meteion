const db = require('@models');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	customId: 'eventEdit',
	async execute(interaction) {
		try {
			await interaction.showModal(getEventEditModal(currentEvent));
			const currentEvent = await db.Event.findByPk(interaction.message.id);

			const isAdmin = currentEvent.user_id === interaction.user.id || interaction.user.id === process.env.SUPERADMIN1;
			if (!isAdmin) return interaction.reply({ content: 'Vous n\'avez pas les droits sur cet événement.', ephemeral: true });

		}
		catch (error) {
			console.error('Erreur lors du traitement du bouton.', error);
			return await interaction.reply({
				content: 'Une erreur est survenue lors du traitement du bouton.',
				ephemeral: true,
			});
		}
	},
};

function getEventEditModal(currentEvent) {
	const modal = new ModalBuilder()
		.setCustomId('eventEditModal')
		.setTitle('Modification d\'un événement.');

	const eventTitleInput = new TextInputBuilder()
		.setCustomId('eventTitle')
		.setLabel('Titre.')
		.setStyle(TextInputStyle.Short)
		.setMaxLength(100)
		.setRequired(true)
		.setValue(currentEvent.event_title);

	const eventDescInput = new TextInputBuilder()
		.setCustomId('eventDesc')
		.setLabel('Description et/ou détails.')
		.setMaxLength(400)
		.setRequired(false)
		.setStyle(TextInputStyle.Paragraph)
		.setValue(currentEvent.event_description);

	const dateInput = new TextInputBuilder()
		.setCustomId('eventDate')
		.setLabel('Date de l\'événement.')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder(getCurrentDate())
		.setMaxLength(10)
		.setRequired(true)
		.setValue(currentEvent.event_date_string);

	const hourInput = new TextInputBuilder()
		.setCustomId('eventHour')
		.setLabel('Heure de l\'événement.')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder(getCurrentHour())
		.setMaxLength(5)
		.setRequired(true)
		.setValue(currentEvent.event_hour_string);

	const eventPlaceInput = new TextInputBuilder()
		.setCustomId('eventPlace')
		.setLabel('Lieu de rassemblement')
		.setMaxLength(100)
		.setStyle(TextInputStyle.Short)
		.setRequired(false)
		.setValue(currentEvent.event_place);

	modal.addComponents(
		new ActionRowBuilder().addComponents(eventTitleInput),
		new ActionRowBuilder().addComponents(eventDescInput),
		new ActionRowBuilder().addComponents(dateInput),
		new ActionRowBuilder().addComponents(hourInput),
		new ActionRowBuilder().addComponents(eventPlaceInput),
	);
	return modal;
}

function getCurrentDate() {
	const currentDate = new Date();
	const day = String(currentDate.getDate()).padStart(2, '0');
	const month = String(currentDate.getMonth() + 1).padStart(2, '0');
	const year = currentDate.getFullYear();
	return formattedDate = `${day}/${month}/${year}`;
}

function getCurrentHour() {
	const currentTime = new Date();
	const hours = currentTime.getHours() + 1;
	return formattedHour = `${String(hours).padStart(2, '0')}h00`;
}