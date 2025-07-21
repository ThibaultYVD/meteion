const BaseRepository = require('./baseRepository');
const { Event } = require('@models');

class EventRepository extends BaseRepository {
	constructor() {
		super(Event);
	}
}

module.exports = new EventRepository();