const DateTimeService = require('../../../Application/services/DateTimeService');

describe('DateTimeService', () => {
	let dateTimeService;

	beforeEach(() => {
		dateTimeService = new DateTimeService();
	});

	describe('getCurrentDate', () => {
		it('should return date in correct format DD/MM/YYYY', () => {
			// Mock the Date objectconst mockDate = new Date('2024-01-15T12:00:00Z');
			const realDate = global.Date;
			global.Date = class extends Date {
				constructor() {
					super();
					return mockDate;
				}
			};

			const result = dateTimeService.getCurrentDate();
			expect(result).toBe('15/01/2024');

			// Restore original Date
			global.Date = realDate;
		});
	});

	describe('getCurrentHour', () => {
		it('should return hour in correct format XXh00', () => {
			const mockDate = new Date('2024-01-15T14:30:00Z');
			const realDate = global.Date;
			global.Date = jest.fn(() => mockDate);

			const result = dateTimeService.getCurrentHour();
			expect(result).toBe('16h00');

			global.Date = realDate;
		});
	});

	describe('isValidDateTime', () => {
		it('should validate correct date and hour format', () => {
			const validCases = [
				{ date: '15/01/2024', hour: '15h00', expected: true },
				{ date: '31/12/2023', hour: '23h00', expected: true },
				{ date: '01/01/2024', hour: '00h00', expected: true },
			];

			validCases.forEach(({ date, hour, expected }) => {
				expect(dateTimeService.isValidDateTime(date, hour)).toBe(expected);
			});
		});

		it('should reject invalid date and hour formats', () => {
			const invalidCases = [
				{ date: '2024.01.15', hour: '15h00' },
				{ date: '15/01/2024', hour: '15.00' },
				{ date: '15/1/2024', hour: '15h00' },
				{ date: '15/13/2024', hour: '24h00' },
			];

			invalidCases.forEach(({ date, hour }) => {
				expect(dateTimeService.isValidDateTime(date, hour)).toBe(false);
			});
		});
		const invalidCases = [
			{ date: '2024-01-15', hour: '15h00' },
			{ date: '15/01/2024', hour: '15:00' },
			{ date: '15-01-2024', hour: '15h00' },
			{ date: '15/13/2024', hour: '24h00' },
		];

		invalidCases.forEach(({ date, hour }) => {
			expect(dateTimeService.isValidDateTime(date, hour)).toBe(false);
		});
	});
});

describe('formatEventDate', () => {
	it('should convert date from DD/MM/YYYY to YYYY-MM-DD', () => {
		expect(dateTimeService.formatEventDate('15/01/2024')).toBe('2024-01-15');
		expect(dateTimeService.formatEventDate('31/12/2023')).toBe('2023-12-31');
	});
});

describe('formatEventHour', () => {
	it('should convert hour from XXhXX to XX:XX', () => {
		expect(dateTimeService.formatEventHour('15h00')).toBe('15:00');
		expect(dateTimeService.formatEventHour('09h30')).toBe('09:30');
	});
});