import { randomHEXColor } from './randomHEXColor';

describe('randomHEXColor', () => {
	it('should return a valid HEX color string', () => {
		const hexColor = randomHEXColor();
		expect(hexColor).toMatch(/^([0-9A-Fa-f]{6})$/);
	});

	it('should return a string of length 6', () => {
		const hexColor = randomHEXColor();
		expect(hexColor.length).toBe(6);
	});

	it('should return a string with valid HEX characters', () => {
		const hexColor = randomHEXColor();
		expect(hexColor).toMatch(/^[0-9A-Fa-f]+$/);
	});

	it('should generate different colors on subsequent calls', () => {
		const hexColor1 = randomHEXColor();
		const hexColor2 = randomHEXColor();
		expect(hexColor1).not.toBe(hexColor2);
	});
});
