class GuildSettingsService {
	constructor(guildSettingsRepository, settingRepository, guildMemberRepository) {
		this.guildSettingsRepository = guildSettingsRepository;
		this.settingRepository = settingRepository;
		this.guildMemberRepository = guildMemberRepository;
	}
	/**
   * Initialise les paramètres par défaut si la guilde n’en a aucun.
   * @param {import('discord.js').Guild} guild La guilde actuelle (objet Discord).
   */
	async initializeGuildSettings(guild) {
		const existingSettings = await this.guildSettingsRepository.findSettingIdsByGuildId(guild.id);

		if (existingSettings.length === 0) {
			const allSettings = await this.settingRepository.findAll();

			await this.guildSettingsRepository.bulkCreate(
				allSettings.map(setting => ({
					guild_id: guild.id,
					setting_id: setting.setting_id,
					activated: setting.activated_by_default,
				})),
			);

		}
	}

	/**
 * Récupère tous les paramètres d'une guilde (avec status formaté ✅ / ❌).
 * @param {Object} guild - L'objet de la guilde (doit contenir `.id`)
 * @returns {Promise<Array<{ setting_display_name: string, activation_status: string }>>}
 */
	async getGuildSettings(guild) {
		if (!guild || !guild.id) {
			throw new Error('Guild invalide ou manquante.');
		}

		const settings = await this.guildSettingsRepository.getSettingsByGuild(guild);

		return settings.map(entry => ({
			setting_display_name: entry.setting_display_name,
			activation_status: entry.activation_status === 'TRUE' ? '✅ Activé' : '❌ Désactivé',
		}));
	}

	/**
   * Insère ou met à jour les infos du membre.
   * @param {import('discord.js').Guild} guild
   * @param {import('discord.js').User} user
   * @param {import('discord.js').GuildMember} member
   */
	async updateOrCreateGuildMember(guild, user, member) {
		await this.guildMemberRepository.updateOrCreate({
			guild_id: guild.id,
			user_id: user.id,
			user_nickname: member.nickname,
			last_bot_interaction: new Date(),
		});
	}
}

module.exports = GuildSettingsService;
