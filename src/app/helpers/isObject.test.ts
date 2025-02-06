import { isObject } from './isObject';

describe('isObject', () => {
	it('should return true for a plain object', () => {
		expect(isObject({})).toBe(true);
		expect(isObject({ key: 'value' })).toBe(true);
	});

	it('should return false for an array', () => {
		expect(isObject([])).toBe(false);
		expect(isObject([1, 2, 3])).toBe(false);
	});

	it('should return false for a string', () => {
		expect(isObject('string')).toBe(false);
	});

	it('should return false for a number', () => {
		expect(isObject(123)).toBe(false);
	});

	it('should return false for a boolean', () => {
		expect(isObject(true)).toBe(false);
		expect(isObject(false)).toBe(false);
	});

	it('should return false for null', () => {
		expect(isObject(null)).toBeFalsy();
	});

	it('should return false for undefined', () => {
		expect(isObject(undefined)).toBeFalsy();
	});

	it('should return false for a function', () => {
		expect(isObject(() => {})).toBeFalsy();
	});

	it('should return true for a date object', () => {
		expect(isObject(new Date())).toBe(true);
	});
});
