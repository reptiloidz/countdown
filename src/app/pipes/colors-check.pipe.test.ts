import { ColorsCheckPipe } from './colors-check.pipe';
import { PointColorTypes } from '../types';

describe('ColorsCheckPipe', () => {
	let pipe: ColorsCheckPipe;

	beforeEach(() => {
		pipe = new ColorsCheckPipe();
	});

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should return true if pointColorsItem is included in colorType', () => {
		const colorType: PointColorTypes[] = ['red', 'blue', 'green'];
		const pointColorsItem: PointColorTypes = 'blue';

		expect(pipe.transform(colorType, pointColorsItem)).toBe(true);
	});

	it('should return false if pointColorsItem is not included in colorType', () => {
		const colorType: PointColorTypes[] = ['red', 'blue', 'green'];
		const pointColorsItem: PointColorTypes = 'yellow';

		expect(pipe.transform(colorType, pointColorsItem)).toBe(false);
	});
});
