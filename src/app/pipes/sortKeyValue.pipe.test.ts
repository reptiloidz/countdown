import { SortKeyValuePipe } from './sortKeyValue.pipe';
import { KeyValue } from '@angular/common';

describe('SortKeyValuePipe', () => {
	let pipe: SortKeyValuePipe;

	beforeEach(() => {
		pipe = new SortKeyValuePipe();
	});

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should return undefined if list is undefined', () => {
		const result = pipe.transform(undefined);
		expect(result).toBeUndefined();
	});

	it('should sort the list by value in ascending order', () => {
		const list: KeyValue<string, string | number>[] = [
			{ key: 'a', value: 3 },
			{ key: 'b', value: 1 },
			{ key: 'c', value: 2 },
		];

		const result = pipe.transform(list);

		expect(result).toEqual([
			{ key: 'b', value: 1 },
			{ key: 'c', value: 2 },
			{ key: 'a', value: 3 },
		]);
	});

	it('should handle string values correctly', () => {
		const list: KeyValue<string, string | number>[] = [
			{ key: 'a', value: '3' },
			{ key: 'b', value: '1' },
			{ key: 'c', value: '2' },
		];

		const result = pipe.transform(list);

		expect(result).toEqual([
			{ key: 'b', value: '1' },
			{ key: 'c', value: '2' },
			{ key: 'a', value: '3' },
		]);
	});

	it('should handle mixed string and number values correctly', () => {
		const list: KeyValue<string, string | number>[] = [
			{ key: 'a', value: '3' },
			{ key: 'b', value: 1 },
			{ key: 'c', value: '2' },
		];

		const result = pipe.transform(list);

		expect(result).toEqual([
			{ key: 'b', value: 1 },
			{ key: 'c', value: '2' },
			{ key: 'a', value: '3' },
		]);
	});

	it('should handle empty list', () => {
		const list: KeyValue<string, string | number>[] = [];

		const result = pipe.transform(list);

		expect(result).toEqual([]);
	});
});
