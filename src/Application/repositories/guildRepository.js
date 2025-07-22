const BaseRepository = require('./baseRepository');

class GuildRepository extends BaseRepository {
	constructor(model) {
		super(model);
	}
}

module.exports = GuildRepository;