const userRepository = require('@repositories/userRepository');
const guildRepository = require('@repositories/guildRepository');
const guildMemberRepository = require('@repositories/guildMemberRepository');

class InteractionService {
	async handleUserAndGuildData({ guild, user, member }) {
		// Utilisateur
		const [userRecord, userCreated] = await userRepository.findOrCreate(
			{ user_id: user.id },
			{
				username: user.username,
				global_name: user.globalName,
				added_date: new Date(),
			},
		);

		if (!userCreated) {
			await userRecord.update({
				username: user.username,
				global_name: user.globalName,
			});
		}

		// Guilde
		const [guildRecord, guildCreated] = await guildRepository.findOrCreate(
			{ guild_id: guild.id },
			{
				guild_name: guild.name,
				guild_total_members: guild.memberCount,
				added_date: new Date(),
			},
		);

		if (!guildCreated) {
			await guildRecord.update({
				guild_name: guild.name,
				guild_total_members: guild.memberCount,
			});
		}

		// Lien Guild - Membre
		await guildMemberRepository.updateOrCreate(
			{ guild_id: guild.id, user_id: user.id },
			{
				user_nickname: member.nickname || null,
				last_bot_interaction: new Date(),
			},
		);
	}
}

module.exports = new InteractionService();