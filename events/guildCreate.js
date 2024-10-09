const { Events } = require('discord.js');
const db = require('../client/models/Models');

// INFO: Ajout ou modification des informations du serveur auquel le bot rejoint.
module.exports = {
	name: Events.GuildCreate,
	async execute(guild) {
		try {
			console.log(`Le bot a rejoint le serveur : ${guild.name}`);
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

				await newGuild.addSettings(defaultSettings);
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