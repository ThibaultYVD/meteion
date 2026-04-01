const EventChoiceService = require('../../../Application/services/EventChoiceService');

describe('EventChoiceService', () => {
	let service;
	let mockEventRepository;
	let mockChoiceRepository;
	let mockUserEventChoiceRepository;

	beforeEach(() => {
		mockEventRepository = { findById: jest.fn() };
		mockChoiceRepository = { findOne: jest.fn() };
		mockUserEventChoiceRepository = {
			findOne: jest.fn(),
			create: jest.fn(),
			findChoicesWithUsers: jest.fn(),
		};
		service = new EventChoiceService(
			mockEventRepository,
			mockChoiceRepository,
			mockUserEventChoiceRepository,
		);
	});

	describe('toggleUserChoice', () => {
		const eventId = 'event-123';
		const userId = 'user-123';
		const choiceName = 'Participant';

		it('should throw if event not found', async () => {
			mockEventRepository.findById.mockResolvedValue(null);
			mockChoiceRepository.findOne.mockResolvedValue({ choice_id: 1 });
			mockUserEventChoiceRepository.findOne.mockResolvedValue(null);

			await expect(service.toggleUserChoice(eventId, userId, choiceName))
				.rejects.toThrow(`L'événement avec l'ID ${eventId} n'existe pas`);
		});

		it('should throw if choice not found in DB', async () => {
			mockEventRepository.findById.mockResolvedValue({ event_id: eventId });
			mockChoiceRepository.findOne.mockResolvedValue(null);
			mockUserEventChoiceRepository.findOne.mockResolvedValue(null);

			await expect(service.toggleUserChoice(eventId, userId, choiceName))
				.rejects.toThrow(`Choix "${choiceName}" non trouvé`);
		});

		it('should create a new choice and return true when no existing choice', async () => {
			mockEventRepository.findById.mockResolvedValue({ event_id: eventId });
			mockChoiceRepository.findOne.mockResolvedValue({ choice_id: 1 });
			mockUserEventChoiceRepository.findOne.mockResolvedValue(null);

			const result = await service.toggleUserChoice(eventId, userId, choiceName);

			expect(mockUserEventChoiceRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({ user_id: userId, event_id: eventId, choice_id: 1, added_at: expect.any(Date) }),
			);
			expect(result).toBe(true);
		});

		it('should update existing choice and return true when choice differs', async () => {
			const mockExisting = { choice_id: 2, update: jest.fn() };
			mockEventRepository.findById.mockResolvedValue({ event_id: eventId });
			mockChoiceRepository.findOne.mockResolvedValue({ choice_id: 1 });
			mockUserEventChoiceRepository.findOne.mockResolvedValue(mockExisting);

			const result = await service.toggleUserChoice(eventId, userId, choiceName);

			expect(mockExisting.update).toHaveBeenCalledWith(
				expect.objectContaining({ choice_id: 1 }),
			);
			expect(result).toBe(true);
		});

		it('should destroy existing choice and return false when choice is the same', async () => {
			const mockExisting = { choice_id: 1, destroy: jest.fn() };
			mockEventRepository.findById.mockResolvedValue({ event_id: eventId });
			mockChoiceRepository.findOne.mockResolvedValue({ choice_id: 1 });
			mockUserEventChoiceRepository.findOne.mockResolvedValue(mockExisting);

			const result = await service.toggleUserChoice(eventId, userId, choiceName);

			expect(mockExisting.destroy).toHaveBeenCalled();
			expect(result).toBe(false);
		});
	});

	describe('getChoicesForEmbed', () => {
		it('should return choices grouped by category using nickname over global_name', async () => {
			mockUserEventChoiceRepository.findChoicesWithUsers.mockResolvedValue([
				{ global_name: 'Alice', user_nickname: 'Ally', choice_id: 1 },
				{ global_name: 'Bob', user_nickname: null, choice_id: 2 },
				{ global_name: 'Charlie', user_nickname: 'Chuck', choice_id: 3 },
				{ global_name: 'Dave', user_nickname: null, choice_id: 4 },
			]);

			const result = await service.getChoicesForEmbed('event-123', 'guild-123');

			expect(result.participants).toEqual(['Ally']);
			expect(result.indecis).toEqual(['Bob']);
			expect(result.reservistes).toEqual(['Chuck']);
			expect(result.absents).toEqual(['Dave']);
		});

		it('should return empty arrays when no choices', async () => {
			mockUserEventChoiceRepository.findChoicesWithUsers.mockResolvedValue([]);

			const result = await service.getChoicesForEmbed('event-123', 'guild-123');

			expect(result).toEqual({ participants: [], indecis: [], reservistes: [], absents: [] });
		});
	});

	describe('updateEmbed', () => {
		it('should update all four fields when all are present', () => {
			const embed = {
				fields: [
					{ name: '✅ Participants (0)', value: '\u200B' },
					{ name: '❓Indécis (0)', value: '\u200B' },
					{ name: '🪑 En réserve (0)', value: '\u200B' },
					{ name: '❌ Absents (0)', value: '\u200B' },
				],
			};

			service.updateEmbed(embed, {
				participants: ['Alice'],
				indecis: ['Bob'],
				reservistes: [],
				absents: ['Charlie'],
			});

			expect(embed.fields[0].name).toBe('✅ Participants (1)');
			expect(embed.fields[1].name).toBe('❓Indécis (1)');
			expect(embed.fields[2].name).toBe('🪑 En réserve (0)');
			expect(embed.fields[3].name).toBe('❌ Absents (1)');
		});

		it('should skip missing fields without throwing', () => {
			const embed = {
				fields: [
					{ name: '✅ Participants (0)', value: '\u200B' },
				],
			};

			expect(() => service.updateEmbed(embed, {
				participants: ['Alice'],
				indecis: [],
				reservistes: [],
				absents: [],
			})).not.toThrow();

			expect(embed.fields[0].name).toBe('✅ Participants (1)');
		});
	});

	describe('_formatList', () => {
		it('should return zero-width space for empty list', () => {
			expect(service._formatList([])).toBe('\u200B');
		});

		it('should format non-empty list with > prefix per line', () => {
			expect(service._formatList(['Alice', 'Bob'])).toBe('> Alice\n> Bob\n');
		});
	});

	describe('_sortChoices', () => {
		it('should group by choice_id and prefer user_nickname over global_name', () => {
			const result = service._sortChoices([
				{ global_name: 'Alice', user_nickname: 'Ally', choice_id: 1 },
				{ global_name: 'Bob', user_nickname: null, choice_id: 2 },
				{ global_name: 'Charlie', user_nickname: 'Chuck', choice_id: 3 },
				{ global_name: 'Dave', user_nickname: null, choice_id: 4 },
			]);

			expect(result.participants).toEqual(['Ally']);
			expect(result.indecis).toEqual(['Bob']);
			expect(result.reservistes).toEqual(['Chuck']);
			expect(result.absents).toEqual(['Dave']);
		});

		it('should return empty arrays for unrecognized choice_ids', () => {
			const result = service._sortChoices([
				{ global_name: 'Ghost', user_nickname: null, choice_id: 99 },
			]);

			expect(result.participants).toEqual([]);
			expect(result.indecis).toEqual([]);
			expect(result.reservistes).toEqual([]);
			expect(result.absents).toEqual([]);
		});
	});
});
