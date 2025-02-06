import { getFirstIteration } from './getFirstIteration';
import { Iteration, Point } from '../interfaces';

describe('getFirstIteration', () => {
	const mockIterations: Iteration[] = [
		{ date: '01.01.1900 00:00', reason: 'byHand' },
		{ date: '31.12.2023 00:00', reason: 'byHand' },
		{ date: '09.09.2323 00:00', reason: 'byHand' },
	];

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

	it('should return the index of the first iteration date in the point dates', () => {
		const result = getFirstIteration(mockIterations, mockPoint);
		expect(result).toBe(0);
	});

	it('should return -1 if the iteration date is not found in the point dates', () => {
		const newIterations: Iteration[] = [{ date: '01.01.2000 00:00', reason: 'byHand' }];
		const result = getFirstIteration(newIterations, mockPoint);
		expect(result).toBe(-1);
	});

	it('should return undefined if point is not provided', () => {
		const result = getFirstIteration(mockIterations);
		expect(result).toBeUndefined();
	});

	it('should return -1 if iterations array is empty', () => {
		const result = getFirstIteration([], mockPoint);
		expect(result).toBe(-1);
	});
});
