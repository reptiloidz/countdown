import { sortDates } from './sortDates';
import { Point } from '../interfaces';
import { parseDate } from './parseDate';

jest.mock('./parseDate', () => ({
	parseDate: jest.fn(),
}));

let mockPoint: Point;

describe('sortDates', () => {
	beforeEach(() => {
		mockPoint = {
			dates: [
				{ date: '10.10.2023 00:00', reason: 'byHand' },
				{ date: '01.01.2023 00:00', reason: 'byHand' },
				{ date: '05.05.2023 00:00', reason: 'byHand' },
			],
			greenwich: false,
			direction: 'forward',
			repeatable: false,
			color: 'red',
			title: 'Test Task',
			modes: [
				{ icon: 'mode1', name: 'Mode 1' },
				{ icon: 'mode2', name: 'Mode 2' },
			],
		};
	});
	it('should sort dates in ascending order', () => {
		(parseDate as jest.Mock).mockImplementation(date => new Date(date));

		const sortedPoint = sortDates(mockPoint);

		expect(sortedPoint.dates).toEqual([
			{ date: '01.01.2023 00:00', reason: 'byHand' },
			{ date: '05.05.2023 00:00', reason: 'byHand' },
			{ date: '10.10.2023 00:00', reason: 'byHand' },
		]);
	});

	it('should handle empty dates array', () => {
		mockPoint.dates = [];

		const sortedPoint = sortDates(mockPoint);

		expect(sortedPoint.dates).toEqual([]);
	});

	it('should not modify the original array if already sorted', () => {
		mockPoint.dates = [
			{ date: '01.01.2023 00:00', reason: 'byHand' },
			{ date: '05.05.2023 00:00', reason: 'byHand' },
			{ date: '10.10.2023 00:00', reason: 'byHand' },
		];

		(parseDate as jest.Mock).mockImplementation(date => new Date(date));

		const sortedPoint = sortDates(mockPoint);

		expect(sortedPoint.dates).toEqual([
			{ date: '01.01.2023 00:00', reason: 'byHand' },
			{ date: '05.05.2023 00:00', reason: 'byHand' },
			{ date: '10.10.2023 00:00', reason: 'byHand' },
		]);
	});
});
