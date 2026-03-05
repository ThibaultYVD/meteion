const BaseRepository = require('./baseRepository');

class EventRepository extends BaseRepository {
	async findActiveEventsWithSettings() {
		return this.model.sequelize.query(`
			SELECT DISTINCT e.*,
				COALESCE(MAX(CASE WHEN s.setting_name = 'event_reminder' THEN gs.activated END), 'TRUE') AS event_reminder,
				COALESCE(MAX(CASE WHEN s.setting_name = 'auto_close_event' THEN gs.activated END), 'TRUE') AS auto_close_event
			FROM events e
			LEFT JOIN guild_settings gs ON gs.guild_id = e.guild_id
			LEFT JOIN settings s ON s.setting_id = gs.setting_id
			WHERE e.event_status NOT IN ('archived', 'cancelled')
			GROUP BY e.event_id;
		`, { type: this.model.sequelize.QueryTypes.SELECT });
	}
}

module.exports = EventRepository;