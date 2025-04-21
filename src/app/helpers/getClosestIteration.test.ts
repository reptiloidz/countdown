import { getClosestIteration } from '../helpers/getClosestIteration';
import { Point, PointMode } from '../interfaces';

jest.mock('../workers/getClosestIteration.util', () => ({
	getClosestIterationWorker: () => {
		return {
			postMessage: jest.fn(function () {
				setTimeout(() => {
					this.onmessage?.({
						data: {
							date: new Date('2025-01-01T12:00:00Z'),
							index: 42,
							mode: { name: 'fff' } as PointMode,
						},
					});
				}, 10);
			}),
			onmessage: null,
			terminate: jest.fn(),
		};
	},
}));

describe('getClosestIteration', () => {
	it('should return the closest iteration data from the worker', async () => {
		const point = {
			id: '1',
			title: 'Test point 1',
			color: 'red',
			dates: [{ date: '01.01.2023 00:00', reason: 'byHand' }],
			direction: 'backward',
			greenwich: true,
			repeatable: false,
		} as Point;
		const result = await getClosestIteration(point);

		expect(result).toEqual({
			date: new Date('2025-01-01T12:00:00Z'),
			index: 42,
			mode: { name: 'fff' } as PointMode,
		});
	});
});
