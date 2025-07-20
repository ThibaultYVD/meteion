const { EmbedBuilder } = require('discord.js');
const db = require('../models/Models');

module.exports = {
	customId: 'eventEditModal',
	async execute(interaction) {
		try {
			const titre = interaction.fields.getTextInputValue('eventTitle');
			const description = interaction.fields.getTextInputValue('eventDesc');
			const date = interaction.fields.getTextInputValue('eventDate');
			const heure = interaction.fields.getTextInputValue('eventHour');
			let place = interaction.fields.getTextInputValue('eventPlace');

			if (!place) place = 'Non renseigné';

			if (!isValidDateTime(date, heure)) {
				return interaction.reply({
					content: 'Erreur(s) au niveau de la **date** et/ou de **l\'heure**. Merci de respecter le format.',
					ephemeral: true,
				});
			}

			const epochTimestamp = Math.floor(Date.parse(`${formatEventDate(date)} ${formatEventHour(heure)}:00`) / 1000);

			if (isNaN(epochTimestamp)) {
				return interaction.reply({
					content: 'Erreur au niveau de la **date** et/ou de **l\'heure**. Merci de respecter le format.',
					ephemeral: true,
				});
			}

			const now = new Date();
			now.setSeconds(0, 0);

			if (epochTimestamp * 1000 < now.getTime()) {
				return interaction.reply({
					content: 'Date et heure invalides. Vous ne pouvez pas définir une date antérieure à l\'heure actuelle.',
					ephemeral: true,
				});
			}

			await interaction.deferUpdate();

			// Modifier l'embed
			const originalEmbed = interaction.message.embeds[0];
			const embed = new EmbedBuilder(originalEmbed.data)
				.setTitle(titre)
				.setDescription(description);

			const dateFieldIndex = embed.data.fields.findIndex(field => field.name.includes('Temps'));
			if (dateFieldIndex !== -1) {
				embed.data.fields[dateFieldIndex].value = `<t:${epochTimestamp}:F>\n*<t:${epochTimestamp}:R>*`;
			}

			const placeFieldIndex = embed.data.fields.findIndex(field => field.name.includes('Lieu de rassemblement'));
			if (placeFieldIndex !== -1) {
				embed.data.fields[placeFieldIndex].value = `*${place}*`;
			}

			await interaction.message.edit({ embeds: [embed] });

			// Mettre à jour la base de données
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

			// Mettre à jour l'événement Discord natif
			const eventRecord = await db.Event.findOne({ where: { event_id: interaction.message.id } });

			if (eventRecord && eventRecord.discord_event_id) {
				const scheduledEvent = await interaction.guild.scheduledEvents.fetch(eventRecord.discord_event_id).catch(() => null);

				if (scheduledEvent) {
					const startTime = new Date(epochTimestamp * 1000);
					const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);

					await scheduledEvent.edit({
						name: titre,
						description: description,
						scheduledStartTime: startTime,
						scheduledEndTime: endTime,
						entityMetadata: { location: place },
					}).catch(err => console.error('Erreur de mise à jour de l\'événement Discord :', err));
				}
			}
		}
		catch (error) {
			console.error('Erreur lors de la gestion du modal :', error);
			return interaction.reply({
				content: 'Une erreur est survenue lors de la modification de l’événement.',
				ephemeral: true,
			});
		}
	},
};

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
