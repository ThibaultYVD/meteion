/**
 * Classe de base pour gérer les opérations courantes sur un modèle Sequelize.
 */
class BaseRepository {
	/**
	 * Initialise le repository avec un modèle Sequelize.
	 * @param {import('sequelize').Model} model - Le modèle Sequelize à manipuler.
	 */
	constructor(model) {
		this.model = model;
	}

	/**
	 * Crée une nouvelle entrée dans la base de données.
	 * @param {Object} data - Les données à insérer.
	 * @returns {Promise<Object>} L'instance créée.
	 */
	async create(data) {
		return this.model.create(data);
	}

	/**
	 * Recherche une entrée par sa clé primaire.
	 * @param {number|string} id - L'identifiant de l'entrée.
	 * @returns {Promise<Object|null>} L'entrée trouvée ou null.
	 */
	async findById(id) {
		return this.model.findByPk(id);
	}

	/**
	 * Recherche toutes les entrées correspondant à un critère.
	 * @param {Object} [where={}] - Le filtre de recherche.
	 * @returns {Promise<Array<Object>>} La liste des entrées correspondantes.
	 */
	async findAll(where = {}) {
		return this.model.findAll({ where });
	}

	/**
	 * Trouve une entrée existante ou la crée si elle n'existe pas.
	 * @param {Object} where - Les critères de recherche.
	 * @param {Object} defaults - Les valeurs par défaut en cas de création.
	 * @returns {Promise<[Object, boolean]>} [instance, created] où `created` indique si une création a eu lieu.
	 */
	async findOrCreate(where = {}, defaults = {}) {
		return this.model.findOrCreate({ where, defaults });
	}

	/**
	  * Crée plusieurs entrées en une seule requête.
	  * @param {Array<Object>} entries - Les objets à insérer.
	  * @returns {Promise<Array<Object>>} Les entrées créées.
	  */
	async bulkCreate(entries) {
		return this.model.bulkCreate(entries);
	}

	/**
	 * Met à jour une entrée par son identifiant.
	 * @param {number|string} id - L'identifiant de l'entrée.
	 * @param {Object} data - Les données à mettre à jour.
	 * @returns {Promise<Object|null>} L'instance mise à jour ou null si non trouvée.
	 */
	async update(id, data) {
		const instance = await this.model.findByPk(id);
		if (!instance) return null;
		return instance.update(data);
	}

	/**
	 * Met à jour une entrée existante ou en crée une nouvelle si elle n'existe pas.
	 * @param {Object} where - Les critères d'identification.
	 * @param {Object} data - Les données à mettre à jour ou à insérer.
	 * @returns {Promise<Object>} L'instance créée ou mise à jour.
	 */
	async updateOrCreate(where, data) {
		const instance = await this.model.findOne({ where });
		if (instance) {
			return instance.update(data);
		}
		else {
			return this.model.create({ ...where, ...data });
		}
	}

	/**
	 * Supprime une entrée par son identifiant.
	 * @param {number|string} id - L'identifiant de l'entrée.
	 * @returns {Promise<Object|null>} L'instance supprimée ou null si non trouvée.
	 */
	async delete(id) {
		const instance = await this.model.findByPk(id);
		if (!instance) return null;
		return instance.destroy();
	}
}

module.exports = BaseRepository;
