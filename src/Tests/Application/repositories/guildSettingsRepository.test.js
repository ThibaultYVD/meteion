const GuildSettingsRepository = require('../../../Application/repositories/guildSettingsRepository');

describe('GuildSettingsRepository', () => {
	let repository;
	let mockGuildSettingModel;
	let mockSettingModel;

	beforeEach(() => {
		mockGuildSettingModel = {
			findAll: jest.fn(),
		};
		mockSettingModel = {};
		repository = new GuildSettingsRepository(mockGuildSettingModel, mockSettingModel);
	});

	describe('findSettingIdsByGuildId', () => {
		it('should return an array of setting IDs for the given guild', async () => {
			mockGuildSettingModel.findAll.mockResolvedValue([
				{ setting_id: 1 },
				{ setting_id: 2 },
			]);

			const result = await repository.findSettingIdsByGuildId('guild-123');

			expect(mockGuildSettingModel.findAll).toHaveBeenCalledWith({
				attributes: ['setting_id'],
				where: { guild_id: 'guild-123' },
			});
			expect(result).toEqual([1, 2]);
		});

		it('should return an empty array when guild has no settings', async () => {
			mockGuildSettingModel.findAll.mockResolvedValue([]);
			expect(await repository.findSettingIdsByGuildId('guild-empty')).toEqual([]);
		});
	});

	describe('getSettingsByGuild', () => {
		it('should return mapped settings with display_name and activation status', async () => {
			mockGuildSettingModel.findAll.mockResolvedValue([
				{ activated: 'TRUE', Setting: { setting_display_name: 'Rappel événement' } },
				{ activated: 'FALSE', Setting: { setting_display_name: 'Fermeture auto' } },
			]);

			const result = await repository.getSettingsByGuild({ id: 'guild-123' });

			expect(mockGuildSettingModel.findAll).toHaveBeenCalledWith(
				expect.objectContaining({ where: { guild_id: 'guild-123' } }),
			);
			expect(result).toEqual([
				{ setting_display_name: 'Rappel événement', activation_status: 'TRUE' },
				{ setting_display_name: 'Fermeture auto', activation_status: 'FALSE' },
			]);
		});

		it('should return an empty array when guild has no settings', async () => {
			mockGuildSettingModel.findAll.mockResolvedValue([]);
			expect(await repository.getSettingsByGuild({ id: 'guild-empty' })).toEqual([]);
		});
	});
});
