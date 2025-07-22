const BaseRepository = require('./baseRepository');

class UserEventChoice extends BaseRepository {
	constructor(model) {
		super(model);
	}
}

module.exports = UserEventChoice;