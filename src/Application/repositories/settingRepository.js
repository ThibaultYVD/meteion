const BaseRepository = require('./baseRepository');
const db = require('@models');

class SettingRepository extends BaseRepository {
	constructor(model) {
		super(model);
	}
}

module.exports = SettingRepository;