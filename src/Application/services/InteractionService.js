class InteractionService {
	constructor(userRepository, guildRepository, guildMemberRepository) {
		this.userRepository = userRepository;
		this.guildRepository = guildRepository;
		this.guildMemberRepository = guildMemberRepository;
	}
	/**
   * Gère la récupération ou la création des données utilisateur et serveur.
   *
   * @param {Object} params - Les paramètres nécessaires à l'initialisation.
   * @param {import('discord.js').Guild} params.guild - Le serveur Discord où l’interaction a eu lieu.
   * @param {import('discord.js').User} params.user - L'utilisateur ayant initié l’interaction.
   * @param {import('discord.js').GuildMember} params.member - Le membre correspondant à l'utilisateur dans le serveur.
   * @returns {Promise<void>} Ne retourne rien, exécute uniquement des opérations asynchrones (DB, cache, etc.).
   */
	async handleUserAndGuildData({ guild, user, member }) {
		// Utilisateur
		const [userRecord, userCreated] = await this.userRepository.findOrCreate(
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
		const [guildRecord, guildCreated] = await this.guildRepository.findOrCreate(
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
		await this.guildMemberRepository.updateOrCreate(
			{ guild_id: guild.id, user_id: user.id },
			{
				user_nickname: member.nickname || null,
				last_bot_interaction: new Date(),
			},
		);
	}
}

module.exports = InteractionService;