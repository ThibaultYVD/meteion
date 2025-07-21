const { Events } = require('discord.js');
const db = require('@models');

// INFO: Ajout ou modification des informations du serveur auquel le bot rejoint.
module.exports = {
	name: Events.GuildCreate,
	async execute(guild) {
		try {
			const [newGuild, created] = await db.Guild.findOrCreate({
				where: { guild_id: guild.id },
				defaults: {
					guild_name: guild.name,
					guild_total_members: guild.memberCount,
					added_date: new Date(),
				},
			});

			if (created) {
				const defaultSettings = await db.Setting.findAll({
					where: { activated_by_default: 'TRUE' },
				});

				defaultSettings.forEach(setting => {
					db.sequelize.query('INSERT INTO guild_settings (guild_id, setting_id, activated) VALUES (:guild_id, :setting_id, :activated)',
						{
							replacements: {
								guild_id: guild.id,
								setting_id: setting.setting_id,
								activated: 'TRUE',
							}, type: db.sequelize.QueryTypes.INSERT,
						},
					);
				});
			}
			else {
				await newGuild.update({
					guild_name: guild.name,
					guild_total_members: guild.memberCount,
					added_date: new Date(),
				});
			}
		}
		catch (error) {
			console.error(error);
		}
	},
};