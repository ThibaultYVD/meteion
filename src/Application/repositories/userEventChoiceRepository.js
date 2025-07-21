const BaseRepository = require('./baseRepository');
const db = require('@models');

class UserEventChoice extends BaseRepository {
	constructor() {
		super(db.UserEventChoice);
	}
}

module.exports = new UserEventChoice();