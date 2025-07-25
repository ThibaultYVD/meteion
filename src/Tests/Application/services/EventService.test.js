const EventService = require('../../../Application/services/EventService');
const DateTimeService = require('../../../Application/services/DateTimeService');

describe('EventService', () => {
	let eventService;
	let mockEventRepository;
	let dateTimeService;
	let mockInteraction;
	let mockGuild;
	let mockClient;
	let mockMessage;

	beforeEach(() => {
		mockEventRepository = {
			create: jest.fn(),
			update: jest.fn(),
			findById: jest.fn(),
		};

		dateTimeService = new DateTimeService();

		mockClient = {
			i18next: {
				t: jest.fn((key, options) => `Translated: ${key}`),
			},
		};

		mockGuild = {
			scheduledEvents: {
				create: jest.fn(),
				fetch: jest.fn(),
			},
		};

		mockInteraction = {
			client: mockClient,
			guild: mockGuild,
			user: { id: '123', username: 'testUser', globalName: 'testGlobalName' },
			member: { nickname: 'testNickname' },
		};

		mockMessage = {
			id: 'message-123',
			embeds: [{
				data: {
					fields: [
						{ name: 'Temps', value: 'old-time' },
						{ name: 'Lieu de rassemblement', value: 'old-place' },
					],
				},
			}],
			edit: jest.fn(),
		};

		eventService = new EventService(mockEventRepository, dateTimeService);
	});


	describe('createEvent', () => {
		// Utiliser une date future pour éviter l'erreur DATE_IN_PAST
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const futureDate = `${String(tomorrow.getDate()).padStart(2, '0')}/${String(tomorrow.getMonth() + 1).padStart(2, '0')}/${tomorrow.getFullYear()}`;

		const validEventData = {
			interaction: {
				client: {
					i18next: {
						t: jest.fn((key, options) => `Translated: ${key}`),
					},
				},
				guild: {
					scheduledEvents: {
						create: jest.fn().mockResolvedValue({ id: 'discord-event-123' }),
					},
				},
				member: {
					nickname: 'testNickname',
				},
				user: {
					globalName: 'testGlobalName',
				},
			},
			title: 'Test Event',
			description: 'Test Description',
			date: futureDate,
			hour: '15h00',
			place: 'Test Place',
		};
	});

	it('should create an event with valid data', async () => {
		mockGuild.scheduledEvents.create.mockResolvedValue({ id: 'discord-event-123' });

		const result = await eventService.createEvent(validEventData);

		expect(result).toHaveProperty('epochTimestamp');
		expect(result).toHaveProperty('discordEventId', 'discord-event-123');
		expect(result).toHaveProperty('metadata');
		expect(result.metadata).toEqual({
			title: validEventData.title,
			description: validEventData.description,
			date: validEventData.date,
			hour: validEventData.hour,
			place: validEventData.place,
			username: 'testNickname',
		});
	});

	it('should throw error for invalid date format', async () => {
		const invalidData = {
			...validEventData,
			date: '2024-01-15',
			hour: '15h00',
		};

		await expect(eventService.createEvent(invalidData))
			.rejects
			.toThrow('INVALID_DATE_FORMAT');
	});

	it('should throw error for past date', async () => {
		const pastData = {
			...validEventData,
			date: '01/01/2020',
			hour: '15h00',
			interaction: {
				...validEventData.interaction,
			},
		};
	});


	describe('persistEvent', () => {
		it('should persist event data to repository', async () => {
			const mockReply = {
				id: 'reply-123',
				guildId: 'guild-123',
				channelId: 'channel-123',
			};

			const mockMetadata = {
				title: 'Test Event',
				description: 'Test Description',
				date: '15/01/2024',
				hour: '15h00',
				place: 'Test Place',
			};

			const mockEpochTimestamp = 1705320000;
			const mockDiscordEventId = 'discord-event-123';

			await eventService.persistEvent({
				reply: mockReply,
				interaction: mockInteraction,
				metadata: mockMetadata,
				epochTimestamp: mockEpochTimestamp,
				discordEventId: mockDiscordEventId,
			});

			expect(mockEventRepository.create).toHaveBeenCalledWith({
				event_id: 'reply-123',
				guild_id: 'guild-123',
				channel_id: 'channel-123',
				user_id: '123',
				event_title: mockMetadata.title,
				event_description: mockMetadata.description,
				event_date_string: mockMetadata.date,
				event_hour_string: mockMetadata.hour,
				event_date_hour_timestamp: mockEpochTimestamp.toString(),
				event_status: 'planned',
				event_place: mockMetadata.place,
				created_at: expect.any(Date),
				discord_event_id: mockDiscordEventId,
			});
		});
	});

	describe('updateEvent', () => {
		it('should update event with valid data', async () => {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			const futureDateStr = `${String(tomorrow.getDate()).padStart(2, '0')}/${String(tomorrow.getMonth() + 1).padStart(2, '0')}/${tomorrow.getFullYear()}`;

			const updateData = {
				message: mockMessage,
				guild: mockGuild,
				client: mockClient,
				title: 'Updated Event',
				description: 'Updated Description',
				date: futureDateStr,
				hour: '15h00',
				place: 'Updated Place',
			};

			mockEventRepository.findById.mockResolvedValue({
				discord_event_id: 'discord-event-123',
			});

			mockGuild.scheduledEvents.fetch.mockResolvedValue({
				status: 1,
				edit: jest.fn(),
			});

			await eventService.updateEvent(updateData);

			expect(mockMessage.edit).toHaveBeenCalled();
			expect(mockEventRepository.update).toHaveBeenCalled();
		});

		it('should throw error for invalid date format in update', async () => {
			const invalidUpdateData = {
				message: mockMessage,
				guild: mockGuild,
				client: mockClient,
				title: 'Updated Event',
				description: 'Updated Description',
				date: '2024-01-15',
				hour: '15h00',
				place: 'Updated Place',
			};

			await expect(eventService.updateEvent(invalidUpdateData))
				.rejects
				.toThrow('INVALID_DATE_FORMAT');
		});
	});

	describe('cancelEvent', () => {
		it('should cancel an existing event', async () => {
			const mockEventId = 'event-123';
			const mockDiscordEvent = {
				delete: jest.fn().mockResolvedValue(true),
			};

			mockEventRepository.findById.mockResolvedValue({
				discord_event_id: 'discord-event-123',
			});

			mockGuild.scheduledEvents.fetch.mockResolvedValue(mockDiscordEvent);

			await eventService.cancelEvent(mockEventId, mockGuild);

			expect(mockEventRepository.update).toHaveBeenCalledWith(
				mockEventId,
				{ event_status: 'cancelled' },
			);
			expect(mockDiscordEvent.delete).toHaveBeenCalled();
		});

		it('should throw error when event not found', async () => {
			mockEventRepository.findById.mockResolvedValue(null);

			await expect(eventService.cancelEvent('non-existent-id', mockGuild))
				.rejects
				.toThrow('Event not found');
		});
	});
});