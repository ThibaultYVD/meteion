const BaseRepository = require('./baseRepository');
const db = require('@models');

class GuildMemberRepository extends BaseRepository {
	constructor() {
		super(db.GuildMember);
	}
}

module.exports = new GuildMemberRepository();