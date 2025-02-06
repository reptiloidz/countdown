import { Point } from '../interfaces';
import { getClosestIteration } from './getClosestIteration';

const mockPoint: Point = {
	dates: [
		{ date: '01.01.1900 00:00', reason: 'byHand' },
		{ date: '31.12.2023 00:00', reason: 'byHand' },
		{ date: '09.09.2323 00:00', reason: 'byHand' },
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

jest.mock('./getPointDate', () => ({
	getPointDate: jest.fn(({ pointDate }) => pointDate),
}));

jest.mock('./sortDates', () => ({
	sortDates: jest.fn(point => point),
}));

describe('getClosestIteration', () => {
	it('should return the closest past iteration when direction is forward', () => {
		const result = getClosestIteration(mockPoint);
		expect(result.index).toBe(1);
		expect(result.mode?.icon).toBe('mode2');
	});

	it('should return the closest future iteration when direction is backward', () => {
		mockPoint.direction = 'backward';
		const result = getClosestIteration(mockPoint);
		expect(result.index).toBe(2);
		expect(result.mode?.icon).toBe('mode1');
	});
});
