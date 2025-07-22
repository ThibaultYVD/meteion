const BaseRepository = require('./baseRepository');

class EventRepository extends BaseRepository {
	constructor(model) {
		super(model);
	}
}

module.exports = EventRepository;