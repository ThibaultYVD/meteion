const BaseRepository = require('./baseRepository');
const db = require('@models');

class SettingRepository extends BaseRepository {
	constructor() {
		super(db.Setting);
	}
}

module.exports = new SettingRepository();