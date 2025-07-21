const BaseRepository = require('./baseRepository');
const db = require('@models');

class UserRepository extends BaseRepository {
	constructor() {
		super(db.User);
	}
}

module.exports = new UserRepository();