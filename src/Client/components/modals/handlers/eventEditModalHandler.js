const { _eventService } = require('@services');

module.exports = {
	customId: 'eventEditModal',
	async execute(interaction) {
		const { fields, message, guild, client } = interaction;

		const title = fields.getTextInputValue('eventTitle');
		const description = fields.getTextInputValue('eventDesc');
		const date = fields.getTextInputValue('eventDate');
		const hour = fields.getTextInputValue('eventHour');
		const place = fields.getTextInputValue('eventPlace') || 'Non renseigné';

		try {
			await _eventService.updateEvent({
				message,
				guild,
				client,
				title,
				description,
				date,
				hour,
				place,
			});

			await interaction.deferUpdate();
		}
		catch (error) {
			console.error('Erreur eventEditModal :', error);

			let content = 'Une erreur est survenue lors de la modification.';
			if (error.message === 'INVALID_DATE_FORMAT') {
				content = 'Format de date/heure invalide. Merci de respecter le format.';
			}
			else if (error.message === 'INVALID_DATE_PARSE') {
				content = 'Impossible d\'analyser la date/heure. Vérifie le format.';
			}
			else if (error.message === 'DATE_IN_PAST') {
				content = 'La date/heure doit être dans le futur.';
			}

			// L’interaction est déjà confirmée → on utilise followUp
			await interaction.followUp({ content, ephemeral: true }).catch(() => {
				//
			});
		}
	},
};
