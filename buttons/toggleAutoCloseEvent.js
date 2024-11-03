const db = require('../models/Models');

module.exports = {
	customId: 'toggleCloseEvent',
	async execute(interaction) {
		try {
			const closeEventValue = interaction.message.embeds[0].fields[1].value;
			let newValue;
			if (closeEventValue === '✅ Activé') {
				newValue = 'FALSE';
				newDisplayValue = '❌ Désactivé';
			}
			else {
				newValue = 'TRUE';
				newDisplayValue = '✅ Activé';
			}

			const setting = await db.Setting.findOne(
				{
					where: {
						setting_name: 'auto_close_event',
					},
				},
			);

			await db.GuildSetting.update(
				{ activated: newValue },
				{
					where: {
						guild_id: interaction.guild.id,
						setting_id: setting.setting_id,
					},
				},
			);

			const updatedEmbed = interaction.message.embeds[0];
			updatedEmbed.fields[1].value = newDisplayValue;

			await interaction.update({
				embeds: [updatedEmbed],
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