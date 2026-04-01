const { _eventRepository } = require("@repositories");
const { _dateTimeService } = require("@services");
const { _errorService, ErrorCodes } = require('@services/ErrorService');
const { getEventEditModal } = require("@modals/builders/eventEditModalBuilder");
const { isCurrentUserIsAdmin } = require("@utils/helpers");

module.exports = {
  customId: "eventEdit",
  async execute(interaction) {
    try {
      const currentEvent = await _eventRepository.findById(interaction.message.id);

      if (!currentEvent) throw _errorService.createError(ErrorCodes.EVENT_NOT_FOUND);
      if (!isCurrentUserIsAdmin(interaction.user.id, currentEvent.user_id)) throw _errorService.createError(ErrorCodes.UNAUTHORIZED);

      const currentDate = _dateTimeService.getCurrentDate();
      const currentHour = _dateTimeService.getCurrentHour();

      const modal = getEventEditModal(currentEvent, currentDate, currentHour);
      await interaction.showModal(modal);
    } catch (error) {
      _errorService.reply(interaction, error)
    }
  },
};
