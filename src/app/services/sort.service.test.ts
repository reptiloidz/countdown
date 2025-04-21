import { TestBed } from '@angular/core/testing';
import { SortService } from './sort.service';
import { Point, PointMode } from '../interfaces';
import { getClosestIteration } from '../helpers';

jest.mock('../helpers', () => ({
	getClosestIteration: jest.fn(),
}));

describe('SortService', () => {
	let service: SortService;

	const mockPoints: Point[] = [
		{
			id: '1',
			title: 'B',
			repeatable: true,
			greenwich: false,
			public: true,
			color: 'blue',
			direction: 'backward',
			dates: [
				{
					date: '15.01.2025 12:25',
					reason: 'byHand',
				},
			],
		},
		{
			id: '2',
			title: 'A',
			repeatable: false,
			greenwich: true,
			public: false,
			color: 'blue',
			direction: 'backward',
			dates: [
				{
					date: '20.01.2025 16:40',
					reason: 'byHand',
				},
			],
		},
	];

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(SortService);

		(getClosestIteration as jest.Mock).mockImplementation(() =>
			Promise.resolve({
				date: new Date('2025-01-01T12:00:00Z'),
				index: 0,
				mode: { name: 'fff' } as PointMode,
			}),
		);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should sort by title ascending', async () => {
		const sortedPoints = await service.sort(mockPoints, 'titleAsc');
		expect(sortedPoints[0].title).toBe('A');
		expect(sortedPoints[1].title).toBe('B');
	});

	it('should sort by title descending', async () => {
		const sortedPoints = await service.sort(mockPoints, 'titleDesc');
		expect(sortedPoints[0].title).toBe('B');
		expect(sortedPoints[1].title).toBe('A');
	});

	it('should sort by repeatable ascending', async () => {
		const sortedPoints = await service.sort(mockPoints, 'repeatableAsc');
		expect(sortedPoints[0].repeatable).toBe(false);
		expect(sortedPoints[1].repeatable).toBe(true);
	});

	it('should sort by repeatable descending', async () => {
		const sortedPoints = await service.sort(mockPoints, 'repeatableDesc');
		expect(sortedPoints[0].repeatable).toBe(true);
		expect(sortedPoints[1].repeatable).toBe(false);
	});

	it('should sort by greenwich ascending', async () => {
		const sortedPoints = await service.sort(mockPoints, 'greenwichAsc');
		expect(sortedPoints[0].greenwich).toBe(false);
		expect(sortedPoints[1].greenwich).toBe(true);
	});

	it('should sort by greenwich descending', async () => {
		const sortedPoints = await service.sort(mockPoints, 'greenwichDesc');
		expect(sortedPoints[0].greenwich).toBe(true);
		expect(sortedPoints[1].greenwich).toBe(false);
	});

	it('should sort by public ascending', async () => {
		const sortedPoints = await service.sort(mockPoints, 'publicAsc');
		expect(sortedPoints[0].public).toBe(false);
		expect(sortedPoints[1].public).toBe(true);
	});

	it('should sort by public descending', async () => {
		const sortedPoints = await service.sort(mockPoints, 'publicDesc');
		expect(sortedPoints[0].public).toBe(true);
		expect(sortedPoints[1].public).toBe(false);
	});

	it('should sort by closest ascending', async () => {
		const sortedPoints = await service.sort(mockPoints, 'closestAsc');

		expect(sortedPoints[0].dates[0].date).toEqual('15.01.2025 12:25');
		expect(sortedPoints[1].dates[0].date).toEqual('20.01.2025 16:40');
	});

	it('should sort by closest descending', async () => {
		const sortedPoints = await service.sort(mockPoints, 'closestDesc');
		expect(sortedPoints[0].dates[0].date).toEqual('20.01.2025 16:40');
		expect(sortedPoints[1].dates[0].date).toEqual('15.01.2025 12:25');
	});

	it('should sort by direction ascending', async () => {
		const sortedPoints = await service.sort(mockPoints, 'directionAsc');
		expect(sortedPoints[0].dates[0].date).toEqual('15.01.2025 12:25');
		expect(sortedPoints[1].dates[0].date).toEqual('20.01.2025 16:40');
	});

	it('should sort by direction descending', async () => {
		const sortedPoints = await service.sort(mockPoints, 'directionDesc');
		expect(sortedPoints[0].dates[0].date).toEqual('20.01.2025 16:40');
		expect(sortedPoints[1].dates[0].date).toEqual('15.01.2025 12:25');
	});
});
