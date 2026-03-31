const UserEventChoiceRepository = require('../../../Application/repositories/userEventChoiceRepository');

describe('UserEventChoiceRepository', () => {
	let repository;
	let mockModel;

	beforeEach(() => {
		mockModel = {
			sequelize: {
				query: jest.fn(),
				QueryTypes: { SELECT: 'SELECT' },
			},
		};
		repository = new UserEventChoiceRepository(mockModel);
	});

	describe('findChoicesWithUsers', () => {
		it('should execute a raw SELECT query with correct parameters', async () => {
			const mockRows = [
				{ global_name: 'Alice', user_nickname: 'Ally', choice_id: 1, choice_name: 'Participant' },
			];
			mockModel.sequelize.query.mockResolvedValue(mockRows);

			const result = await repository.findChoicesWithUsers('event-123', 'guild-456');

			expect(mockModel.sequelize.query).toHaveBeenCalledWith(
				expect.stringContaining('user_event_choices'),
				expect.objectContaining({
					replacements: { event_id: 'event-123', guild_id: 'guild-456' },
					type: 'SELECT',
				}),
			);
			expect(result).toEqual(mockRows);
		});

		it('should return an empty array when no choices exist', async () => {
			mockModel.sequelize.query.mockResolvedValue([]);
			const result = await repository.findChoicesWithUsers('event-empty', 'guild-123');
			expect(result).toEqual([]);
		});
	});
});
