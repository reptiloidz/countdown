import { SortIterationsPipe } from './sortIterations.pipe';
import { Iteration } from '../interfaces';
import { compareAsc } from 'date-fns';
import { parseDate } from '../helpers';

jest.mock('date-fns', () => ({
	compareAsc: jest.fn(),
}));

jest.mock('../helpers', () => ({
	parseDate: jest.fn(),
}));

describe('SortIterationsPipe', () => {
	let pipe: SortIterationsPipe;

	beforeEach(() => {
		pipe = new SortIterationsPipe();
	});

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should return undefined if iterations is undefined', () => {
		const result = pipe.transform(undefined);
		expect(result).toBeUndefined();
	});

	it('should sort iterations by date in ascending order', () => {
		const iterations: Iteration[] = [{ date: '2023-01-01' } as Iteration, { date: '2022-01-01' } as Iteration];

		(parseDate as jest.Mock).mockImplementation((date: string) => new Date(date));
		(compareAsc as jest.Mock).mockImplementation((a: Date, b: Date) => a.getTime() - b.getTime());

		const result = pipe.transform(iterations);

		expect(result).toEqual([{ date: '2022-01-01' } as Iteration, { date: '2023-01-01' } as Iteration]);
		expect(parseDate).toHaveBeenCalledWith('2023-01-01');
		expect(parseDate).toHaveBeenCalledWith('2022-01-01');
		expect(compareAsc).toHaveBeenCalledWith(new Date('2022-01-01'), new Date('2023-01-01'));
	});

	it('should handle empty iterations array', () => {
		const iterations: Iteration[] = [];

		const result = pipe.transform(iterations);

		expect(result).toEqual([]);
	});
});
