const db = require('@models');

// Repositories
const GuildSettingsRepository = require('@repositories/guildSettingsRepository');
const SettingRepository = require('@repositories/settingRepository');
const GuildRepository = require('@repositories/guildRepository');
const UserRepository = require('@repositories/userRepository');
const GuildMemberRepository = require('@repositories/guildMemberRepository');
const EventRepository = require('@repositories/eventRepository');
const ChoiceRepository = require('@repositories/choiceRepository');
const UserEventChoiceRepository = require('@repositories/userEventChoiceRepository');

// Instanciation des repositories
const _guildSettingsRepository = new GuildSettingsRepository(db.GuildSetting, db.Setting);
const _settingRepository = new SettingRepository(db.Setting);
const _guildRepository = new GuildRepository(db.Guild);
const _userRepository = new UserRepository(db.User);
const _guildMemberRepository = new GuildMemberRepository(db.GuildMember);
const _eventRepository = new EventRepository(db.Event);
const _choiceRepository = new ChoiceRepository(db.Choice);
const _userEventChoiceRepository = new UserEventChoiceRepository(db.UserEventChoice);

module.exports = {
	_guildSettingsRepository,
	_settingRepository,
	_guildRepository,
	_userRepository,
	_guildMemberRepository,
	_eventRepository,
	_choiceRepository,
	_userEventChoiceRepository,
};