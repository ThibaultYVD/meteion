const { Events } = require('discord.js');
const { _guildRepository } = require('@repositories');
const { _guildSettingsService } = require('@services');

// INFO: Ajout ou modification des informations du serveur auquel le bot rejoint.
module.exports = {
	name: Events.GuildCreate,
	async execute(guild) {
		try {
			const [newGuild, created] = await _guildRepository.findOrCreate(
				{ guild_id: guild.id },
				{
					guild_name: guild.name,
					guild_total_members: guild.memberCount,
					added_date: new Date(),
				});

			if (created) {
				await _guildSettingsService.initializeGuildSettings(guild);
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