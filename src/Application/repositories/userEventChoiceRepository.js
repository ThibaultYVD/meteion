const BaseRepository = require('./baseRepository');

class UserEventChoiceRepository extends BaseRepository {
	async findChoicesWithUsers(eventId, guildId) {
		return this.model.sequelize.query(`
			SELECT u.global_name, gm.user_nickname, c.choice_id, c.choice_name
			FROM user_event_choices uec
			JOIN users u ON u.user_id = uec.user_id
			LEFT JOIN guild_members gm ON gm.user_id = u.user_id AND gm.guild_id = :guild_id
			JOIN choices c ON c.choice_id = uec.choice_id
			WHERE uec.event_id = :event_id
			ORDER BY uec.added_at ASC
		`, {
			replacements: { event_id: eventId, guild_id: guildId },
			type: this.model.sequelize.QueryTypes.SELECT,
		});
	}
}

module.exports = UserEventChoiceRepository;