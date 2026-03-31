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

	describe('findOne', () => {
		it('should return the matching instance', async () => {
			const mockWhere = { name: 'test' };
			const mockInstance = { id: 1, name: 'test' };
			jest.spyOn(mockModel, 'findOne').mockResolvedValue(mockInstance);

			const result = await repository.findOne(mockWhere);

			expect(mockModel.findOne).toHaveBeenCalledWith({ where: mockWhere });
			expect(result).toEqual(mockInstance);
		});

		it('should return null when no match found', async () => {
			jest.spyOn(mockModel, 'findOne').mockResolvedValue(null);
			expect(await repository.findOne({ name: 'ghost' })).toBeNull();
		});
	});

	describe('findOrCreate', () => {
		it('should return [instance, false] when record already exists', async () => {
			const existing = { id: 1 };
			jest.spyOn(mockModel, 'findOrCreate').mockResolvedValue([existing, false]);

			const [instance, created] = await repository.findOrCreate({ id: 1 }, { name: 'test' });

			expect(created).toBe(false);
			expect(instance).toEqual(existing);
		});

		it('should return [instance, true] when record is created', async () => {
			const newInstance = { id: 2, name: 'new' };
			jest.spyOn(mockModel, 'findOrCreate').mockResolvedValue([newInstance, true]);

			const [instance, created] = await repository.findOrCreate({ id: 2 }, { name: 'new' });

			expect(created).toBe(true);
			expect(instance).toEqual(newInstance);
		});
	});

	describe('bulkCreate', () => {
		it('should create multiple entries and return them', async () => {
			const entries = [{ name: 'a' }, { name: 'b' }];
			const created = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];
			jest.spyOn(mockModel, 'bulkCreate').mockResolvedValue(created);

			const result = await repository.bulkCreate(entries);

			expect(mockModel.bulkCreate).toHaveBeenCalledWith(entries);
			expect(result).toEqual(created);
		});
	});

	describe('update', () => {
		it('should update and return the instance when found', async () => {
			const updated = { id: 1, name: 'updated' };
			const mockInstance = { update: jest.fn().mockResolvedValue(updated) };
			jest.spyOn(mockModel, 'findByPk').mockResolvedValue(mockInstance);

			const result = await repository.update(1, { name: 'updated' });

			expect(mockInstance.update).toHaveBeenCalledWith({ name: 'updated' });
			expect(result).toEqual(updated);
		});

		it('should return null when instance not found', async () => {
			jest.spyOn(mockModel, 'findByPk').mockResolvedValue(null);
			expect(await repository.update(999, { name: 'x' })).toBeNull();
		});
	});

	describe('updateOrCreate', () => {
		it('should update existing instance when found', async () => {
			const updated = { id: 1, name: 'updated' };
			const mockInstance = { update: jest.fn().mockResolvedValue(updated) };
			jest.spyOn(mockModel, 'findOne').mockResolvedValue(mockInstance);

			const result = await repository.updateOrCreate({ id: 1 }, { name: 'updated' });

			expect(mockInstance.update).toHaveBeenCalledWith({ name: 'updated' });
			expect(result).toEqual(updated);
		});

		it('should create new instance with merged data when not found', async () => {
			const created = { id: 2, name: 'new' };
			jest.spyOn(mockModel, 'findOne').mockResolvedValue(null);
			jest.spyOn(mockModel, 'create').mockResolvedValue(created);

			const result = await repository.updateOrCreate({ id: 2 }, { name: 'new' });

			expect(mockModel.create).toHaveBeenCalledWith({ id: 2, name: 'new' });
			expect(result).toEqual(created);
		});
	});

	describe('delete', () => {
		it('should destroy and return the instance when found', async () => {
			const mockInstance = { id: 1, destroy: jest.fn().mockResolvedValue({ id: 1 }) };
			jest.spyOn(mockModel, 'findByPk').mockResolvedValue(mockInstance);

			const result = await repository.delete(1);

			expect(mockInstance.destroy).toHaveBeenCalled();
			expect(result).toEqual({ id: 1 });
		});

		it('should return null when instance not found', async () => {
			jest.spyOn(mockModel, 'findByPk').mockResolvedValue(null);
			expect(await repository.delete(999)).toBeNull();
		});
	});
});