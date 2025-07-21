const BaseRepository = require('./baseRepository');
const db = require('@models');

class ChoiceRepository extends BaseRepository {
	constructor() {
		super(db.Choice);
	}
}

module.exports = new ChoiceRepository();