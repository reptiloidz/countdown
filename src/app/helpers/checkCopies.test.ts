import { checkCopies } from './checkCopies';
import { Point, Iteration } from '../interfaces';

describe('checkCopies', () => {
	let point: Point;
	let iteration: Iteration;

	beforeEach(() => {
		point = {
			dates: [
				{ date: '01.01.2023', reason: 'byHand' },
				{ date: '02.01.2023', reason: 'byHand' },
				{ date: '03.01.2023', reason: 'byHand' },
				{ date: '02.01.2023', reason: 'byHand' },
			],
		} as Point;

		iteration = { date: '02.01.2023', reason: 'byHand' } as Iteration;
	});

	it('should return true if the current number is greater than 0 and the dates are not equal', () => {
		const result = !checkCopies(point, iteration, 1);
		expect(result).toBe(true);
	});

	it('should return false if the current number is greater than 0 and the dates are equal', () => {
		point.dates[1].date = '01.01.2023';
		const result = checkCopies(point, iteration, 1);
		expect(result).toBe(false);
	});

	it('should return true if the current number is not provided and there are multiple dates matching the iteration date', () => {
		const result = checkCopies(point, iteration);
		expect(result).toBe(true);
	});

	it('should return false if the current number is not provided and there is only one date matching the iteration date', () => {
		point.dates = [
			{ date: '06.01.2023', reason: 'byHand' },
			{ date: '04.01.2023', reason: 'byHand' },
		];
		const result = checkCopies(point, iteration);
		expect(result).toBe(false);
	});

	it('should return true if the current number is 0', () => {
		const result = checkCopies(point, iteration, 0);
		expect(result).toBe(true);
	});

	it('should return true if the current number is negative', () => {
		const result = checkCopies(point, iteration, -1);
		expect(result).toBe(true);
	});
});
