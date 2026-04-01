const BatchService = require('../../../Application/services/BatchService');

describe('BatchService', () => {
	let service;
	let mockEventRepository;
	let mockClient;
	let mockChannel;
	let mockMessage;

	const now = Math.floor(Date.now() / 1000);

	beforeEach(() => {
		mockMessage = {
			edit: jest.fn().mockResolvedValue({}),
			delete: jest.fn().mockResolvedValue({}),
		};
		mockChannel = {
			send: jest.fn().mockResolvedValue({ id: 'sent-msg-123' }),
			messages: {
				fetch: jest.fn().mockResolvedValue(mockMessage),
				delete: jest.fn().mockResolvedValue({}),
			},
		};
		mockClient = {
			channels: { cache: { get: jest.fn().mockReturnValue(mockChannel) } },
		};
		mockEventRepository = {
			findActiveEventsWithSettings: jest.fn(),
			update: jest.fn().mockResolvedValue({}),
		};
		service = new BatchService(mockEventRepository);
	});

	describe('sendReminderMessages', () => {
		it('should send reminder and update DB for an eligible event', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_id: 'evt-1',
				event_title: 'Mon event',
				channel_id: 'ch-1',
				event_status: 'planned',
				event_date_hour_timestamp: now + 1800,
				remember_message_id: null,
				event_reminder: 'TRUE',
			}]);

			const result = await service.sendReminderMessages(mockClient);

			expect(mockChannel.send).toHaveBeenCalled();
			expect(mockEventRepository.update).toHaveBeenCalledWith('evt-1', { remember_message_id: 'sent-msg-123' });
			expect(result).toEqual({ processed: 1 });
		});

		it('should skip events with status other than planned', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_status: 'ongoing',
				event_date_hour_timestamp: now + 1800,
				remember_message_id: null,
				event_reminder: 'TRUE',
			}]);

			const result = await service.sendReminderMessages(mockClient);
			expect(mockChannel.send).not.toHaveBeenCalled();
			expect(result).toEqual({ processed: 0 });
		});

		it('should skip events starting more than 1 hour away', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_status: 'planned',
				event_date_hour_timestamp: now + 7200,
				remember_message_id: null,
				event_reminder: 'TRUE',
			}]);

			const result = await service.sendReminderMessages(mockClient);
			expect(mockChannel.send).not.toHaveBeenCalled();
			expect(result).toEqual({ processed: 0 });
		});

		it('should skip events that have already started', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_status: 'planned',
				event_date_hour_timestamp: now - 60,
				remember_message_id: null,
				event_reminder: 'TRUE',
			}]);

			const result = await service.sendReminderMessages(mockClient);
			expect(mockChannel.send).not.toHaveBeenCalled();
			expect(result).toEqual({ processed: 0 });
		});

		it('should skip events where reminder was already sent', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_status: 'planned',
				event_date_hour_timestamp: now + 1800,
				remember_message_id: 'existing-msg',
				event_reminder: 'TRUE',
			}]);

			const result = await service.sendReminderMessages(mockClient);
			expect(mockChannel.send).not.toHaveBeenCalled();
			expect(result).toEqual({ processed: 0 });
		});

		it('should skip events with reminder disabled', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_status: 'planned',
				event_date_hour_timestamp: now + 1800,
				remember_message_id: null,
				event_reminder: 'FALSE',
			}]);

			const result = await service.sendReminderMessages(mockClient);
			expect(mockChannel.send).not.toHaveBeenCalled();
			expect(result).toEqual({ processed: 0 });
		});

		it('should return { processed: 0 } on repository error', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockRejectedValue(new Error('DB error'));
			const result = await service.sendReminderMessages(mockClient);
			expect(result).toEqual({ processed: 0 });
		});
	});

	describe('manageEventStarts', () => {
		const justStarted = Math.floor((Date.now() - 60 * 1000) / 1000);

		it('should mark event as ongoing', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_id: 'evt-1',
				event_title: 'Test',
				channel_id: 'ch-1',
				event_status: 'planned',
				event_date_hour_timestamp: justStarted,
				remember_message_id: null,
				event_reminder: 'FALSE',
			}]);

			const result = await service.manageEventStarts(mockClient);

			expect(mockEventRepository.update).toHaveBeenCalledWith('evt-1', { event_status: 'ongoing' });
			expect(result).toEqual({ processed: 1 });
		});

		it('should edit the reminder message when reminder is enabled', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_id: 'evt-1',
				event_title: 'Test',
				channel_id: 'ch-1',
				event_status: 'planned',
				event_date_hour_timestamp: justStarted,
				remember_message_id: 'remind-msg-1',
				event_reminder: 'TRUE',
			}]);

			await service.manageEventStarts(mockClient);

			expect(mockChannel.messages.fetch).toHaveBeenCalledWith('remind-msg-1');
			expect(mockMessage.edit).toHaveBeenCalled();
		});

		it('should skip events that started more than 3 hours ago', async () => {
			const longAgo = Math.floor((Date.now() - 4 * 3600 * 1000) / 1000);
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_status: 'planned',
				event_date_hour_timestamp: longAgo,
			}]);

			const result = await service.manageEventStarts(mockClient);
			expect(mockEventRepository.update).not.toHaveBeenCalled();
			expect(result).toEqual({ processed: 0 });
		});

		it('should skip events starting more than 2 minutes in the future', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_status: 'planned',
				event_date_hour_timestamp: now + 600,
			}]);

			const result = await service.manageEventStarts(mockClient);
			expect(mockEventRepository.update).not.toHaveBeenCalled();
			expect(result).toEqual({ processed: 0 });
		});

		it('should skip events with status other than planned', async () => {
			const justStarted2 = Math.floor((Date.now() - 30 * 1000) / 1000);
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_status: 'ongoing',
				event_date_hour_timestamp: justStarted2,
			}]);

			const result = await service.manageEventStarts(mockClient);
			expect(mockEventRepository.update).not.toHaveBeenCalled();
			expect(result).toEqual({ processed: 0 });
		});
	});

	describe('manageEventEnds', () => {
		const fourHoursAgo = Math.floor((Date.now() - 4 * 3600 * 1000) / 1000);

		it('should mark event as finished and edit its embed message', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_id: 'evt-1',
				event_title: 'Test',
				channel_id: 'ch-1',
				event_status: 'ongoing',
				event_date_hour_timestamp: fourHoursAgo,
				remember_message_id: null,
				event_reminder: 'FALSE',
			}]);

			const result = await service.manageEventEnds(mockClient);

			expect(mockChannel.messages.fetch).toHaveBeenCalledWith('evt-1');
			expect(mockMessage.edit).toHaveBeenCalled();
			expect(mockEventRepository.update).toHaveBeenCalledWith('evt-1', { event_status: 'finished' });
			expect(result).toEqual({ processed: 1 });
		});

		it('should also edit reminder message when reminder is enabled', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_id: 'evt-1',
				event_title: 'Test',
				channel_id: 'ch-1',
				event_status: 'ongoing',
				event_date_hour_timestamp: fourHoursAgo,
				remember_message_id: 'remind-1',
				event_reminder: 'TRUE',
			}]);

			await service.manageEventEnds(mockClient);

			expect(mockChannel.messages.fetch).toHaveBeenCalledWith('remind-1');
		});

		it('should skip events that have not been running for 3 hours yet', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_status: 'ongoing',
				event_date_hour_timestamp: now - 3600,
			}]);

			const result = await service.manageEventEnds(mockClient);
			expect(mockEventRepository.update).not.toHaveBeenCalled();
			expect(result).toEqual({ processed: 0 });
		});

		it('should skip events with status other than ongoing', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_status: 'planned',
				event_date_hour_timestamp: fourHoursAgo,
			}]);

			const result = await service.manageEventEnds(mockClient);
			expect(mockEventRepository.update).not.toHaveBeenCalled();
			expect(result).toEqual({ processed: 0 });
		});
	});

	describe('archiveEvents', () => {
		const fourDaysAgo = Math.floor((Date.now() - 4 * 24 * 3600 * 1000) / 1000);

		it('should archive event and delete its reminder message', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_id: 'evt-1',
				channel_id: 'ch-1',
				event_date_hour_timestamp: fourDaysAgo,
				remember_message_id: 'remind-1',
				auto_close_event: 'FALSE',
			}]);

			const result = await service.archiveEvents(mockClient);

			expect(mockEventRepository.update).toHaveBeenCalledWith('evt-1', { event_status: 'archived' });
			expect(mockChannel.messages.fetch).toHaveBeenCalledWith('remind-1');
			expect(mockMessage.delete).toHaveBeenCalled();
			expect(result).toEqual({ processed: 1 });
		});

		it('should delete event message when auto_close_event is TRUE', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_id: 'evt-1',
				channel_id: 'ch-1',
				event_date_hour_timestamp: fourDaysAgo,
				remember_message_id: null,
				auto_close_event: 'TRUE',
			}]);

			await service.archiveEvents(mockClient);

			expect(mockChannel.messages.delete).toHaveBeenCalledWith('evt-1');
		});

		it('should skip events that ended less than 3 days ago', async () => {
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_date_hour_timestamp: now - 3600,
			}]);

			const result = await service.archiveEvents(mockClient);
			expect(mockEventRepository.update).not.toHaveBeenCalled();
			expect(result).toEqual({ processed: 0 });
		});

		it('should not crash if reminder message was already deleted', async () => {
			mockChannel.messages.fetch.mockResolvedValue(null);
			mockEventRepository.findActiveEventsWithSettings.mockResolvedValue([{
				event_id: 'evt-1',
				channel_id: 'ch-1',
				event_date_hour_timestamp: fourDaysAgo,
				remember_message_id: 'gone-msg',
				auto_close_event: 'FALSE',
			}]);

			const result = await service.archiveEvents(mockClient);
			expect(result).toEqual({ processed: 1 });
		});
	});
});
