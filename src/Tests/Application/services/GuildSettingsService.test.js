const GuildSettingsService = require('../../../Application/services/GuildSettingsService');

describe('GuildSettingsService', () => {
	let guildSettingsService;
	let mockGuildSettingsRepository;
	let mockSettingRepository;
	let mockGuildMemberRepository;

	beforeEach(() => {
		mockGuildSettingsRepository = {
			findSettingIdsByGuildId: jest.fn(),
			getSettingsByGuild: jest.fn(),
			bulkCreate: jest.fn(),
		};

		mockSettingRepository = {
			findAll: jest.fn(),
		};

		mockGuildMemberRepository = {
			updateOrCreate: jest.fn(),
		};

		guildSettingsService = new GuildSettingsService(
			mockGuildSettingsRepository,
			mockSettingRepository,
			mockGuildMemberRepository,
		);
	});

	describe('initializeGuildSettings', () => {
		const mockGuild = { id: 'guild-123' };

		it('should initialize settings for new guild', async () => {
			// Simulate no existing settings
			mockGuildSettingsRepository.findSettingIdsByGuildId.mockResolvedValue([]);

			// Mock available settings
			const mockSettings = [
				{ setting_id: 1, activated_by_default: true },
				{ setting_id: 2, activated_by_default: false },
			];
			mockSettingRepository.findAll.mockResolvedValue(mockSettings);

			await guildSettingsService.initializeGuildSettings(mockGuild);

			expect(mockGuildSettingsRepository.bulkCreate).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						guild_id: 'guild-123',
						setting_id: 1,
						activated: true,
					}),
					expect.objectContaining({
						guild_id: 'guild-123',
						setting_id: 2,
						activated: false,
					}),
				]),
			);
		});

		it('should not initialize settings if guild already has them', async () => {
			// Simulate existing settings
			mockGuildSettingsRepository.findSettingIdsByGuildId.mockResolvedValue([1, 2]);

			await guildSettingsService.initializeGuildSettings(mockGuild);

			expect(mockSettingRepository.findAll).not.toHaveBeenCalled();
			expect(mockGuildSettingsRepository.bulkCreate).not.toHaveBeenCalled();
		});
	});

	describe('getGuildSettings', () => {
		const mockGuild = { id: 'guild-123' };

		it('should return formatted settings list', async () => {
			const mockSettings = [
				{ setting_display_name: 'Setting 1', activation_status: 'TRUE' },
				{ setting_display_name: 'Setting 2', activation_status: 'FALSE' },
			];

			mockGuildSettingsRepository.getSettingsByGuild.mockResolvedValue(mockSettings);

			const result = await guildSettingsService.getGuildSettings(mockGuild);

			expect(result).toEqual([
				{ setting_display_name: 'Setting 1', activation_status: '✅ Activé' },
				{ setting_display_name: 'Setting 2', activation_status: '❌ Désactivé' },
			]);
		});

		it('should throw error if guild parameter is invalid', async () => {
			await expect(guildSettingsService.getGuildSettings(null))
				.rejects
				.toThrow('Paramètre "guild" invalide ou manquant.');
		});

		it('should return empty array if no settings found', async () => {
			mockGuildSettingsRepository.getSettingsByGuild.mockResolvedValue(null);

			const result = await guildSettingsService.getGuildSettings(mockGuild);

			expect(result).toEqual([]);
		});
	});

	describe('updateOrCreateGuildMember', () => {
		const mockGuild = { id: 'guild-123' };
		const mockUser = { id: 'user-123' };
		const mockMember = { nickname: 'TestNick' };

		it('should update or create guild member', async () => {
			await guildSettingsService.updateOrCreateGuildMember(mockGuild, mockUser, mockMember);

			expect(mockGuildMemberRepository.updateOrCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					guild_id: 'guild-123',
					user_id: 'user-123',
					user_nickname: 'TestNick',
					last_bot_interaction: expect.any(Date),
				}),
			);
		});
	});
});