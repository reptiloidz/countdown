import { getInvertedObject } from './getInvertedObject';

describe('getInvertedObject', () => {
	it('should return an inverted object', () => {
		const input = { a: '1', b: '2', c: '3' };
		const expectedOutput = { '1': 'a', '2': 'b', '3': 'c' };
		const result = getInvertedObject(input);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle an empty object', () => {
		const input = {};
		const expectedOutput = {};
		const result = getInvertedObject(input);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle an object with duplicate values', () => {
		const input = { a: '1', b: '1', c: '2' };
		const expectedOutput = { '1': 'b', '2': 'c' }; // Last key with the same value should be kept
		const result = getInvertedObject(input);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle an object with numeric string values', () => {
		const input = { a: '1', b: '2', c: '3' };
		const expectedOutput = { '1': 'a', '2': 'b', '3': 'c' };
		const result = getInvertedObject(input);
		expect(result).toEqual(expectedOutput);
	});

	it('should handle an object with mixed string values', () => {
		const input = { a: 'one', b: 'two', c: 'three' };
		const expectedOutput = { 'one': 'a', 'two': 'b', 'three': 'c' };
		const result = getInvertedObject(input);
		expect(result).toEqual(expectedOutput);
	});
});
