import { CheckCopiesPipe } from './check-copies.pipe';
import { Point } from '../interfaces';
import { checkCopies } from '../helpers';

jest.mock('../helpers', () => ({
	checkCopies: jest.fn(),
}));

describe('CheckCopiesPipe', () => {
	let pipe: CheckCopiesPipe;

	beforeEach(() => {
		pipe = new CheckCopiesPipe();
	});

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should return true when checkCopies returns true', () => {
		const point: Point = { dates: [{ date: '2023-01-01' }] } as Point;
		(checkCopies as jest.Mock).mockReturnValue(true);

		expect(pipe.transform(0, point)).toBe(true);
		expect(checkCopies).toHaveBeenCalledWith(point, point.dates[0], undefined);
	});

	it('should return false when checkCopies returns false', () => {
		const point: Point = { dates: [{ date: '2023-01-01' }] } as Point;
		(checkCopies as jest.Mock).mockReturnValue(false);

		expect(pipe.transform(0, point)).toBe(false);
		expect(checkCopies).toHaveBeenCalledWith(point, point.dates[0], undefined);
	});

	it('should return undefined when point is undefined', () => {
		expect(pipe.transform(0, undefined)).toBeUndefined();
		expect(checkCopies).not.toHaveBeenCalled();
	});

	it('should call checkCopies with index when comparePrev is true', () => {
		const point: Point = { dates: [{ date: '2023-01-01' }] } as Point;
		(checkCopies as jest.Mock).mockReturnValue(true);

		expect(pipe.transform(0, point, true)).toBe(true);
		expect(checkCopies).toHaveBeenCalledWith(point, point.dates[0], 0);
	});
});
