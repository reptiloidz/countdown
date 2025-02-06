import { isDateValid } from './isDateValid';

describe('isDateValid', () => {
	it('should return true for a valid date string', () => {
		expect(isDateValid('2023-10-10')).toBe(true);
	});

	it('should return true for a valid date object', () => {
		expect(isDateValid(new Date())).toBe(true);
	});

	it('should return false for an invalid date string', () => {
		expect(isDateValid('invalid-date')).toBe(false);
	});

	it('should return false for an invalid date object', () => {
		expect(isDateValid(new Date('invalid-date'))).toBe(false);
	});

	it('should return true for a non-date value', () => {
		expect(isDateValid(12345)).toBe(true);
	});

	it('should return false for an empty string', () => {
		expect(isDateValid('')).toBe(false);
	});

	it('should return false for null', () => {
		expect(isDateValid(null)).toBe(false);
	});

	it('should return false for undefined', () => {
		expect(isDateValid(undefined)).toBe(false);
	});
});
