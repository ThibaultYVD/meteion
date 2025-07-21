const { EmbedBuilder } = require('discord.js');
const db = require('@models');

module.exports = {
	customId: 'eventDeleteModal',
	async execute(interaction) {
		try {
			const value = interaction.fields.getTextInputValue('eventTitleDelete');

			if (value.toLowerCase() !== 'annuler') return interaction.reply({ content: 'La validation a échouée. Merci d\'entrer "annuler" pour supprimer cet événement.', ephemeral: true });

			const eventId = interaction.message.id;
			const currentEvent = await db.Event.findByPk(eventId);

			const channel = interaction.channel;

			if (currentEvent.remember_message_id !== null) await channel.messages.delete(currentEvent.remember_message_id);

			const guildScheduledEvent = await interaction.guild.scheduledEvents.fetch(currentEvent.discord_event_id).catch(() => null);
			if (guildScheduledEvent) {
				await guildScheduledEvent.delete().catch(() => {
					// Ignoré intentionnellement si déjà supprimé
				});
			}

			await db.Event.update({
				event_status: 'cancelled',
			}, {
				where: { event_id: interaction.message.id },
			});

			await channel.messages.delete(eventId);
			await interaction.deferUpdate();

		}
		catch (error) {
			console.log(error);
		}
	},
};