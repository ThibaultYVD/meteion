const BaseRepository = require('./baseRepository');

class UserRepository extends BaseRepository {
	constructor(model) {
		super(model);
	}
}

module.exports = UserRepository;