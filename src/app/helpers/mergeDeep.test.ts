import { mergeDeep } from './mergeDeep';

describe('mergeDeep', () => {
	it('should merge two plain objects', () => {
		const target = { a: 1, b: 2 };
		const source = { b: 3, c: 4 };
		const result = mergeDeep(target, source);
		expect(result).toEqual({ a: 1, b: 3, c: 4 });
	});

	it('should merge nested objects', () => {
		const target = { a: 1, b: { x: 1, y: 2 } };
		const source = { b: { y: 3, z: 4 }, c: 5 };
		const result = mergeDeep(target, source);
		expect(result).toEqual({ a: 1, b: { x: 1, y: 3, z: 4 }, c: 5 });
	});

	it('should handle multiple sources', () => {
		const target = { a: 1 };
		const source1 = { b: 2 };
		const source2 = { c: 3 };
		const result = mergeDeep(target, source1, source2);
		expect(result).toEqual({ a: 1, b: 2, c: 3 });
	});

	it('should handle deep nested objects', () => {
		const target = { a: { b: { c: 1 } } };
		const source = { a: { b: { d: 2 } } };
		const result = mergeDeep(target, source);
		expect(result).toEqual({ a: { b: { c: 1, d: 2 } } });
	});

	it('should not modify the source objects', () => {
		const target = { a: 1 };
		const source = { b: 2 };
		const result = mergeDeep(target, source);
		expect(result).toEqual({ a: 1, b: 2 });
		expect(source).toEqual({ b: 2 });
	});

	it('should return the target if no sources are provided', () => {
		const target = { a: 1 };
		const result = mergeDeep(target);
		expect(result).toEqual({ a: 1 });
	});

	it('should handle non-object sources', () => {
		const target = { a: 1 };
		const source = 'not an object';
		const result = mergeDeep(target, source as any);
		expect(result).toEqual({ a: 1 });
	});

	it('should handle undefined sources', () => {
		const target = { a: 1 };
		const result = mergeDeep(target, undefined as any);
		expect(result).toEqual({ a: 1 });
	});
});
