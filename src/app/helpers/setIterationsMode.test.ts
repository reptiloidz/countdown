import { setIterationsMode } from './setIterationsMode';
import { Point } from '../interfaces';

let mockPoint: Point;

describe('setIterationsMode', () => {
	beforeEach(() => {
		mockPoint = {
			dates: [
				{ date: '10.10.2023 00:00', reason: 'byHand' },
				{ date: '11.10.2023 00:00', reason: 'byHand' },
				{ date: '12.10.2023 00:00', reason: 'byHand' },
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

	it('should set iteration modes correctly for alternating dates', () => {
		const result = setIterationsMode(mockPoint);

		expect(result.dates[0].mode?.icon).toBe('mode1');
		expect(result.dates[1].mode?.icon).toBe('mode2');
		expect(result.dates[2].mode?.icon).toBe('mode1');
	});

	it('should set iteration modes correctly for consecutive same dates', () => {
		mockPoint.dates = [
			{ date: '10.10.2023 00:00', reason: 'byHand' },
			{ date: '10.10.2023 00:00', reason: 'byHand' },
			{ date: '12.10.2023 00:00', reason: 'byHand' },
		];
		const result = setIterationsMode(mockPoint);

		expect(result.dates[0].mode?.icon).toBe('mode1');
		expect(result.dates[1].mode?.icon).toBe('mode1');
		expect(result.dates[2].mode?.icon).toBe('mode2');
	});

	it('should handle empty modes array', () => {
		mockPoint.modes = [];
		const result = setIterationsMode(mockPoint);

		expect(result.dates[0].mode?.icon).toBeUndefined();
		expect(result.dates[1].mode?.icon).toBeUndefined();
	});

	it('should handle undefined modes', () => {
		mockPoint.modes = undefined;
		const result = setIterationsMode(mockPoint);

		expect(result.dates[0].mode?.icon).toBeUndefined();
		expect(result.dates[1].mode?.icon).toBeUndefined();
	});

	it('should return the same point object if no dates are provided', () => {
		mockPoint.dates = [];
		const result = setIterationsMode(mockPoint);

		expect(result).toEqual(mockPoint);
	});
});
