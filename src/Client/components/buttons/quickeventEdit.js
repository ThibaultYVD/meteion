const { _eventRepository } = require('@repositories');
const { _dateTimeService } = require('@services');
const { _errorService, ErrorCodes } = require('@services/ErrorService');
const { getQuickeventEditModal } = require('@modals/builders/quickeventEditModalBuilder');
const { isCurrentUserIsAdmin } = require('@utils/helpers');

module.exports = {
	customId: 'quickeventEdit',
	async execute(interaction) {
		try {
			const currentEvent = await _eventRepository.findById(interaction.message.id);

			if (!currentEvent) throw _errorService.createError(ErrorCodes.EVENT_NOT_FOUND);
			if (!isCurrentUserIsAdmin(interaction.user.id, currentEvent.user_id)) throw _errorService.createError(ErrorCodes.UNAUTHORIZED);

			const modal = getQuickeventEditModal(
				currentEvent,
				_dateTimeService.getCurrentDate(),
				_dateTimeService.getCurrentHour(),
			);
			await interaction.showModal(modal);
		}
		catch (error) {
			_errorService.reply(interaction, error)
		}
	},
};
