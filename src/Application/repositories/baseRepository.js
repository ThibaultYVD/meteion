class BaseRepository {
	constructor(model) {
		this.model = model;
	}

	async create(data) {
		return this.model.create(data);
	}

	async findById(id) {
		return this.model.findByPk(id);
	}

	async findAll(where = {}) {
		return this.model.findAll({ where });
	}

	async findOrCreate(where = {}, defaults = {}) {
		console.log(where);
		console.log(defaults);
		return this.model.findOrCreate({ where, defaults });
	}

	async update(id, data) {
		const instance = await this.model.findByPk(id);
		if (!instance) return null;
		return instance.update(data);
	}

	async updateOrCreate(where, data) {
		const instance = await this.model.findOne({ where });
		if (instance) {
			return instance.update(data);
		}
		else {
			return this.model.create({ ...where, ...data });
		}
	}

	async delete(id) {
		const instance = await this.model.findByPk(id);
		if (!instance) return null;
		return instance.destroy();
	}
}

module.exports = BaseRepository;
