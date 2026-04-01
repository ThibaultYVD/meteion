const { getEventDeleteModal } = require('@modals/builders/eventDeleteModalBuilder');
const { _eventRepository } = require('@repositories');
const { isCurrentUserIsAdmin } = require("@utils/helpers");
const { _errorService, ErrorCodes } = require('@services/ErrorService');

module.exports = {
	customId: 'eventDelete',
	async execute(interaction) {
		try {
			const currentEvent = await _eventRepository.findById(interaction.message.id);

			if (!isCurrentUserIsAdmin(interaction.user.id, currentEvent.user_id)) throw _errorService.createError(ErrorCodes.UNAUTHORIZED);

			const modal = getEventDeleteModal();
			await interaction.showModal(modal);
		}
		catch (error) {
			_errorService.reply(interaction, error)
		}
	},
};