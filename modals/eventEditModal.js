const { EmbedBuilder } = require('discord.js');
const db = require('../models/Models');

module.exports = {
	customId: 'eventEditModal',
	async execute(interaction) {
		try {
			// Récupération des valeurs du modal
			const titre = interaction.fields.getTextInputValue('eventTitle');
			const description = interaction.fields.getTextInputValue('eventDesc');
			const date = interaction.fields.getTextInputValue('eventDate');
			const heure = interaction.fields.getTextInputValue('eventHour');
			let place = interaction.fields.getTextInputValue('eventPlace');

			if (place === '' || place === null) place = 'Non renseigné';

			// Validation du format de la date et de l'heure
			if (!isValidDateTime(date, heure)) {
				// Si une erreur de validation survient, répondre directement sans déférer l'interaction
				return interaction.reply({
					content: 'Erreur(s) au niveau de la **date** et/ou de **l\'heure**. Merci de respecter le format.',
					ephemeral: true,
				});
			}

			// Validation du timestamp
			const epochTimestamp = Math.floor(Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}`) / 1000);
			if (isNaN(epochTimestamp)) {
				return interaction.reply({
					content: 'Erreur au niveau de la **date** et/ou de **l\'heure**. Merci de respecter le format.',
					ephemeral: true,
				});
			}

			// Déférer l'interaction immédiatement pour éviter que l'interaction expire
			await interaction.deferUpdate();

			// Récupérer l'embed existant et le convertir en EmbedBuilder
			const originalEmbed = interaction.message.embeds[0];
			const embed = new EmbedBuilder(originalEmbed.data);

			// Mettre à jour le titre, la description, la date et le lieu dans l'embed existant
			embed.setTitle(titre);
			embed.setDescription(description);

			// Chercher et mettre à jour les champs spécifiques dans l'embed
			const dateFieldIndex = embed.data.fields.findIndex(field => field.name.includes('Temps'));
			if (dateFieldIndex !== -1) {
				embed.data.fields[dateFieldIndex].value = `<t:${epochTimestamp}:F>\n*<t:${epochTimestamp}:R>*`;;
			}

			const placeFieldIndex = embed.data.fields.findIndex(field => field.name.includes('Lieu de rassemblement'));
			if (placeFieldIndex !== -1) {
				embed.data.fields[placeFieldIndex].value = `*${place}*`;
			}

			// Mise à jour de l'embed dans le message
			await interaction.message.edit({ embeds: [embed] });

			// Mettre à jour l'événement dans la base de données
			await db.Event.update({
				event_title: titre,
				event_description: description,
				event_date_string: date,
				event_hour_string: heure,
				event_date_hour_timestamp: epochTimestamp.toString(),
				event_place: place,
			}, {
				where: { event_id: interaction.message.id },
			});

		}
		catch (error) {
			console.error('Erreur lors de la gestion du modal :', error);
		}
	},
};

// Fonctions utilitaires pour la validation et le formatage
function isValidDateTime(date, heure) {
	const isValidDate = /^\d{2}\/\d{2}\/\d{4}$/.test(date);
	const isValidHour = /^\d{2}h\d{2}$/.test(heure);
	return isValidDate && isValidHour;
}

function formatEventDate(date) {
	const [day, month, year] = date.split('/');
	return `${year}-${month}-${day}`;
}

function formatEventHour(hour) {
	return hour.replace('h', ':');
}
