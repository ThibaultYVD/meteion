const BaseRepository = require('./baseRepository');
const db = require('@models');

class GuildRepository extends BaseRepository {
	constructor() {
		super(db.Guild);
	}
}

module.exports = new GuildRepository();