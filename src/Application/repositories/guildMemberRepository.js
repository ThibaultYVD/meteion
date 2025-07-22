const BaseRepository = require('./baseRepository');

class GuildMemberRepository extends BaseRepository {
	constructor(model) {
		super(model);
	}
}

module.exports = GuildMemberRepository;