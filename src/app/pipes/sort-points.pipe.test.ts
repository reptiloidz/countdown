import { SortPointsPipe } from './sort-points.pipe';
import { SortService } from '../services/sort.service';
import { Point } from '../interfaces';
import { SortTypes } from '../types';

describe('SortPointsPipe', () => {
	let pipe: SortPointsPipe;
	let sortService: SortService;

	beforeEach(() => {
		sortService = {
			sort: jest.fn(),
		} as unknown as SortService;
		pipe = new SortPointsPipe(sortService);
	});

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should call sortService.sort with the correct arguments', () => {
		const points: Point[] = [{ title: 'Point 1' } as Point, { title: 'Point 2' } as Point];
		const sortType: SortTypes = 'closestAsc';

		pipe.transform(points, sortType);

		expect(sortService.sort).toHaveBeenCalledWith(points, sortType);
	});

	it('should return sorted points', () => {
		const points: Point[] = [{ title: 'Point 1' } as Point, { title: 'Point 2' } as Point];
		const sortedPoints: Point[] = [{ title: 'Point 2' } as Point, { title: 'Point 1' } as Point];
		const sortType: SortTypes = 'closestAsc';

		(sortService.sort as jest.Mock).mockReturnValue(sortedPoints);

		const result = pipe.transform(points, sortType);

		expect(result).toEqual(sortedPoints);
	});
});
