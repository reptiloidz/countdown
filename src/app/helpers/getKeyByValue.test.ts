import { getKeyByValue } from './getKeyByValue';
import { SelectArray } from 'src/app/interfaces';

describe('getKeyByValue', () => {
	const mockValues: SelectArray[] = [
		{ key: 'key1', value: 'value1' },
		{ key: 'key2', value: 'value2' },
		{ key: 'key3', value: 3 },
	];

	it('should return the correct key for a given string value', () => {
		const result = getKeyByValue(mockValues, 'value1');
		expect(result).toBe('key1');
	});

	it('should return the correct key for a given numeric value', () => {
		const result = getKeyByValue(mockValues, 3);
		expect(result).toBe('key3');
	});

	it('should return undefined if the value is not found', () => {
		const result = getKeyByValue(mockValues, 'nonexistent');
		expect(result).toBeUndefined();
	});

	it('should return undefined if the values array is empty', () => {
		const result = getKeyByValue([], 'value1');
		expect(result).toBeUndefined();
	});

	it('should return undefined if the search value is null or undefined', () => {
		const result1 = getKeyByValue(mockValues, null as any);
		const result2 = getKeyByValue(mockValues, undefined as any);
		expect(result1).toBeUndefined();
		expect(result2).toBeUndefined();
	});
});
