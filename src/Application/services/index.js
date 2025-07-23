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
const EventService = require('@services/EventService');

// Instanciation des services
const _guildSettingsService = new GuildSettingsService(_guildSettingsRepository, _settingRepository, _guildMemberRepository);
const _interactionService = new InteractionService(_userRepository, _guildRepository, _guildMemberRepository);
const _dateTimeService = new DateTimeService();
const _eventService = new EventService(_eventRepository, _dateTimeService);

// Export de tous les services instanciés
module.exports = {
	_guildSettingsService,
	_interactionService,
	_dateTimeService,
	_eventService,
};
