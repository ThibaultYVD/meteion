const {
	_choiceRepository,
	_eventRepository,
	_guildMemberRepository,
	_guildRepository,
	_guildSettingsRepository,
	_settingRepository,
	_userEventChoiceRepository,
	_userRepository,
} = require('@repositories');

// Services
const GuildSettingsService = require('@services/GuildSettingsService');
const InteractionService = require('@services/InteractionService');
const DateTimeService = require('@services/DateTimeService');

// Instanciation des services
const _guildSettingsService = new GuildSettingsService(_guildSettingsRepository, _settingRepository, _guildMemberRepository);
const _interactionService = new InteractionService(_userRepository, _guildRepository, _guildMemberRepository);
const _dateTimeService = new DateTimeService();

// Export de tous les services instanciés
module.exports = {
	_guildSettingsService,
	_interactionService,
	_dateTimeService,
};
