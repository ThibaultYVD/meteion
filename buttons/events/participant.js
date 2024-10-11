const { } = require('discord.js');
const db = require('../models/Models');

module.exports = {
	customId: 'participant',
	async execute(interaction) {
		try {
			const { user, member } = interaction;
			// Récupération du nom d'utilisateur ou du pseudo
			const username = member.nickname || user.globalName;

			// INFO: Mise à jour des informations de l'utilisateur
			await Promise.all([
				(async () => {
					const [userRecord, created] = await db.User.findOrCreate({
						where: { user_id: user.id },
						defaults: {
							username: user.username,
							global_name: user.globalName,
							added_date: new Date(),
						},
					});

					if (!created) {
						await userRecord.update({
							username: user.username,
							global_name: user.globalName,
						});
					}
				})(),

				db.GuildMember.upsert({
					guild_id: guild.id,
					user_id: user.id,
					user_nickname: member.nickname,
					last_bot_interaction: new Date(),
				}),
			]);
		}
		catch (error) {
			console.error('Erreur lors de la gestion du modal :', error);
			return await interaction.reply({
				content: 'Une erreur est survenue lors de la création de l\'événement.',
				ephemeral: true,
			});
		}
	},
};
