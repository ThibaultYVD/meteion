const EventRepository = require('../../../Application/repositories/eventRepository');

describe('EventRepository', () => {
	let repository;
	let mockModel;

	beforeEach(() => {
		mockModel = {
			sequelize: {
				query: jest.fn(),
				QueryTypes: { SELECT: 'SELECT' },
			},
		};
		repository = new EventRepository(mockModel);
	});

	describe('findActiveEventsWithSettings', () => {
		it('should execute a raw SELECT query and return events', async () => {
			const mockEvents = [
				{ event_id: 'evt-1', event_status: 'planned', event_reminder: 'TRUE', auto_close_event: 'FALSE' },
				{ event_id: 'evt-2', event_status: 'ongoing', event_reminder: 'FALSE', auto_close_event: 'TRUE' },
			];
			mockModel.sequelize.query.mockResolvedValue(mockEvents);

			const result = await repository.findActiveEventsWithSettings();

			expect(mockModel.sequelize.query).toHaveBeenCalledWith(
				expect.stringContaining('event_status NOT IN'),
				expect.objectContaining({ type: 'SELECT' }),
			);
			expect(result).toEqual(mockEvents);
		});

		it('should not include archived or cancelled events in the query filter', async () => {
			mockModel.sequelize.query.mockResolvedValue([]);
			await repository.findActiveEventsWithSettings();

			const [sql] = mockModel.sequelize.query.mock.calls[0];
			expect(sql).toContain('archived');
			expect(sql).toContain('cancelled');
		});

		it('should return an empty array when no active events exist', async () => {
			mockModel.sequelize.query.mockResolvedValue([]);
			expect(await repository.findActiveEventsWithSettings()).toEqual([]);
		});
	});
});
