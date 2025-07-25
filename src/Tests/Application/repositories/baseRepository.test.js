const BaseRepository = require('../../../Application/repositories/baseRepository');
const { Model } = require('sequelize');

// Mock de Sequelize Model
class MockModel extends Model {
	static create() {
		//
	}
	static findByPk() {
		//
	}
	static findAll() {
		//
	}
	static findOrCreate() {
		//
	}
	static bulkCreate() {
		//
	}
	static findOne() {
		//
	}
}

describe('BaseRepository', () => {
	let repository;
	let mockModel;

	beforeEach(() => {
		// Réinitialisation des mocks avant chaque test
		mockModel = MockModel;
		repository = new BaseRepository(mockModel);
	});

	describe('create', () => {
		it('should create a new entry', async () => {
			const mockData = { name: 'test' };
			const mockCreatedInstance = { id: 1, ...mockData };

			jest.spyOn(mockModel, 'create').mockResolvedValue(mockCreatedInstance);

			const result = await repository.create(mockData);

			expect(mockModel.create).toHaveBeenCalledWith(mockData);
			expect(result).toEqual(mockCreatedInstance);
		});
	});

	describe('findById', () => {
		it('should find an entry by id', async () => {
			const mockId = 1;
			const mockInstance = { id: mockId, name: 'test' };

			jest.spyOn(mockModel, 'findByPk').mockResolvedValue(mockInstance);

			const result = await repository.findById(mockId);

			expect(mockModel.findByPk).toHaveBeenCalledWith(mockId);
			expect(result).toEqual(mockInstance);
		});

		it('should return null when entry not found', async () => {
			jest.spyOn(mockModel, 'findByPk').mockResolvedValue(null);

			const result = await repository.findById(1);

			expect(result).toBeNull();
		});
	});

	// Exemple de test pour findAll
	describe('findAll', () => {
		it('should find all entries matching criteria', async () => {
			const mockWhere = { status: 'active' };
			const mockInstances = [
				{ id: 1, status: 'active' },
				{ id: 2, status: 'active' },
			];

			jest.spyOn(mockModel, 'findAll').mockResolvedValue(mockInstances);

			const result = await repository.findAll(mockWhere);

			expect(mockModel.findAll).toHaveBeenCalledWith({ where: mockWhere });
			expect(result).toEqual(mockInstances);
		});
	});

	// À compléter avec d'autres tests pour les méthodes restantes...
});