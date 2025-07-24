module.exports = {
	customId: 'eventOver',
	async execute(interaction) {
		try {
			await interaction.reply({
				content: '## L\'événement est terminé, vous ne pouvez plus vous inscrire ni le modifier.\nIl sera automatiquement supprimé ultérieurement si le paramètre est actif.',
				ephemeral: true,
			});
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