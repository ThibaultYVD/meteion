jest.mock('@embeds/errorEmbedBuilder', () => ({
	getErrorEmbed: jest.fn().mockReturnValue({ type: 'mock-embed' }),
}));

const { AppError, ErrorCodes, _errorService } = require('../../../Application/services/ErrorService');

describe('ErrorService', () => {
	beforeEach(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('AppError', () => {
		it('should set code, name, meta and httpStatus', () => {
			const err = new AppError('DATE_IN_PAST', 'dev msg', { foo: 'bar' }, 422);
			expect(err).toBeInstanceOf(Error);
			expect(err.name).toBe('AppError');
			expect(err.code).toBe('DATE_IN_PAST');
			expect(err.meta).toEqual({ foo: 'bar' });
			expect(err.httpStatus).toBe(422);
		});

		it('should use defaults for optional params', () => {
			const err = new AppError('UNKNOWN');
			expect(err.meta).toEqual({});
			expect(err.httpStatus).toBe(400);
		});
	});

	describe('normalize', () => {
		it('should return AppError instances unchanged', () => {
			const original = new AppError('DATE_IN_PAST');
			expect(_errorService.normalize(original)).toBe(original);
		});

		it('should wrap a known error message in an AppError', () => {
			const raw = new Error('DATE_IN_PAST');
			const result = _errorService.normalize(raw);
			expect(result).toBeInstanceOf(AppError);
			expect(result.code).toBe('DATE_IN_PAST');
		});

		it('should wrap an unknown error as UNKNOWN AppError', () => {
			const result = _errorService.normalize(new Error('something weird'));
			expect(result).toBeInstanceOf(AppError);
			expect(result.code).toBe(ErrorCodes.UNKNOWN);
		});
	});

	describe('toUserMessage', () => {
		it('should return translated message when client has i18next', () => {
			const mockClient = { i18next: { t: jest.fn().mockReturnValue('Message traduit') } };
			const err = new AppError('DATE_IN_PAST');
			const msg = _errorService.toUserMessage(err, mockClient);
			expect(mockClient.i18next.t).toHaveBeenCalledWith('errors.DATE_IN_PAST', expect.any(Object));
			expect(msg).toBe('Message traduit');
		});

		it('should fall back to catalog when client has no i18next', () => {
			const err = new AppError('DATE_IN_PAST');
			const msg = _errorService.toUserMessage(err, null);
			expect(typeof msg).toBe('string');
			expect(msg.length).toBeGreaterThan(0);
		});

		it('should return UNKNOWN message for unrecognized code', () => {
			const err = new AppError('SOME_RANDOM_CODE');
			const msg = _errorService.toUserMessage(err, null);
			expect(typeof msg).toBe('string');
		});
	});

	describe('createError', () => {
		it('should return an AppError with given code and message', () => {
			const err = _errorService.createError('DATE_IN_PAST', 'dev detail', { id: 1 });
			expect(err).toBeInstanceOf(AppError);
			expect(err.code).toBe('DATE_IN_PAST');
			expect(err.meta).toEqual({ id: 1 });
		});
	});

	describe('reply', () => {
		it('should call interaction.reply when not yet replied', async () => {
			const mockInteraction = {
				deferred: false,
				replied: false,
				reply: jest.fn().mockResolvedValue({}),
			};
			const mockClient = { i18next: { t: jest.fn().mockReturnValue('Erreur') } };

			await _errorService.reply(mockInteraction, mockClient, new Error('DATE_IN_PAST'));

			expect(mockInteraction.reply).toHaveBeenCalledWith(
				expect.objectContaining({ ephemeral: true }),
			);
		});

		it('should call interaction.followUp when already deferred', async () => {
			const mockInteraction = {
				deferred: true,
				replied: false,
				followUp: jest.fn().mockResolvedValue({}),
			};
			const mockClient = { i18next: { t: jest.fn().mockReturnValue('Erreur') } };

			await _errorService.reply(mockInteraction, mockClient, new Error('UNKNOWN'));

			expect(mockInteraction.followUp).toHaveBeenCalled();
		});
	});
});
