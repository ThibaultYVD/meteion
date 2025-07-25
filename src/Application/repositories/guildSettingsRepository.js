const BaseRepository = require('./baseRepository');

class GuildSettingsRepository extends BaseRepository {
	constructor(GuildSettingModel, SettingModel) {
		super(GuildSettingModel);
		this.SettingsModel = SettingModel;
	}

	/**
   * Récupère tous les paramètres d'une guilde (retourne uniquement les `setting_id`)
   * @param {string} guildId - L'identifiant de la guilde
   * @returns {Promise<Array<string>>}
   */
	async findSettingIdsByGuildId(guildId) {
		const settings = await this.model.findAll({
			attributes: ['setting_id'],
			where: { guild_id: guildId },
		});

		return settings.map(s => s.setting_id);
	}

	/**
	 * Récupère tous les paramètres liés à une guilde avec leur statut d'activation.
	 * @param {string|number} guildId - L'identifiant de la guilde.
	 * @returns {Promise<Array<{ setting_display_name: string, activation_status: int }>>}
	 */
	async getSettingsByGuild(guild) {
		const results = await this.model.findAll({
			where: { guild_id: guild.id },
			include: [
				{
					model: this.SettingsModel,
					as: 'Setting',
					attributes: ['setting_display_name'],
				},
			],
			attributes: ['activated'],
		});

		return results.map(entry => ({
			setting_display_name: entry.Setting.setting_display_name,
			activation_status: entry.activated,
		}));
	}
}

module.exports = GuildSettingsRepository;