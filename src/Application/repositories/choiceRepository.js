const BaseRepository = require('./baseRepository');
class ChoiceRepository extends BaseRepository {
	constructor(model) {
		super(model);
	}
}

module.exports = ChoiceRepository;