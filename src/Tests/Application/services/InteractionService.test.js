const InteractionService = require('../../../Application/services/InteractionService');

describe('InteractionService', () => {
	let interactionService;
	let mockUserRepository;
	let mockGuildRepository;
	let mockGuildMemberRepository;

	beforeEach(() => {
		mockUserRepository = {
			findOrCreate: jest.fn(),
		};

		mockGuildRepository = {
			findOrCreate: jest.fn(),
		};

		mockGuildMemberRepository = {
			updateOrCreate: jest.fn(),
		};

		interactionService = new InteractionService(
			mockUserRepository,
			mockGuildRepository,
			mockGuildMemberRepository,
		);
	});

	describe('handleUserAndGuildData', () => {
		const mockData = {
			guild: {
				id: 'guild-123',
				name: 'Test Guild',
				memberCount: 100,
			},
			user: {
				id: 'user-123',
				username: 'TestUser',
				globalName: 'Global TestUser',
			},
			member: {
				nickname: 'Member Nickname',
			},
		};

		it('should handle new user and guild data', async () => {
			// Mock new user creation
			const mockUserInstance = {
				update: jest.fn(),
			};
			mockUserRepository.findOrCreate.mockResolvedValue([mockUserInstance, true]);

			// Mock new guild creation
			const mockGuildInstance = {
				update: jest.fn(),
			};
			mockGuildRepository.findOrCreate.mockResolvedValue([mockGuildInstance, true]);

			await interactionService.handleUserAndGuildData(mockData);

			// Verify user creation
			expect(mockUserRepository.findOrCreate).toHaveBeenCalledWith(
				{ user_id: 'user-123' },
				{
					username: 'TestUser',
					global_name: 'Global TestUser',
					added_date: expect.any(Date),
				},
			);

			// Verify guild creation
			expect(mockGuildRepository.findOrCreate).toHaveBeenCalledWith(
				{ guild_id: 'guild-123' },
				{
					guild_name: 'Test Guild',
					guild_total_members: 100,
					added_date: expect.any(Date),
				},
			);

			// Verify guild member link creation
			expect(mockGuildMemberRepository.updateOrCreate).toHaveBeenCalledWith(
				{ guild_id: 'guild-123', user_id: 'user-123' },
				{
					user_nickname: 'Member Nickname',
					last_bot_interaction: expect.any(Date),
				},
			);
		});

		it('should update existing user and guild data', async () => {
			// Mock existing user update
			const mockUserInstance = {
				update: jest.fn(),
			};
			mockUserRepository.findOrCreate.mockResolvedValue([mockUserInstance, false]);

			// Mock existing guild update
			const mockGuildInstance = {
				update: jest.fn(),
			};
			mockGuildRepository.findOrCreate.mockResolvedValue([mockGuildInstance, false]);

			await interactionService.handleUserAndGuildData(mockData);

			// Verify user update
			expect(mockUserInstance.update).toHaveBeenCalledWith({
				username: 'TestUser',
				global_name: 'Global TestUser',
			});

			// Verify guild update
			expect(mockGuildInstance.update).toHaveBeenCalledWith({
				guild_name: 'Test Guild',
				guild_total_members: 100,
			});

			// Verify guild member link update
			expect(mockGuildMemberRepository.updateOrCreate).toHaveBeenCalled();
		});

		it('should handle user without nickname', async () => {
			const mockDataWithoutNickname = {
				...mockData,
				member: {
					nickname: null,
				},
			};

			mockUserRepository.findOrCreate.mockResolvedValue([{ update: jest.fn() }, false]);
			mockGuildRepository.findOrCreate.mockResolvedValue([{ update: jest.fn() }, false]);

			await interactionService.handleUserAndGuildData(mockDataWithoutNickname);

			expect(mockGuildMemberRepository.updateOrCreate).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					user_nickname: null,
				}),
			);
		});
	});
});
