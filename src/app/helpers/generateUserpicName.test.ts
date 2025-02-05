import { generateUserpicName } from './generateUserpicName';

describe('generateUserpicName', () => {
	it('should replace spaces with plus signs', () => {
		const result = generateUserpicName('John Doe');
		expect(result).toBe('John+Doe');
	});

	it('should return the same string if there are no spaces', () => {
		const result = generateUserpicName('JohnDoe');
		expect(result).toBe('JohnDoe');
	});

	it('should handle multiple spaces correctly', () => {
		const result = generateUserpicName('John Doe Smith');
		expect(result).toBe('John+Doe+Smith');
	});

	it('should return an empty string if input is an empty string', () => {
		const result = generateUserpicName('');
		expect(result).toBe('');
	});

	it('should return undefined if input is undefined', () => {
		const result = generateUserpicName(undefined as unknown as string);
		expect(result).toBeUndefined();
	});

	it('should return null if input is null', () => {
		const result = generateUserpicName(null as unknown as string);
		expect(result).toBeUndefined();
	});
});
