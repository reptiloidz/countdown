import { FilterPipe } from './filter.pipe';
import { Point } from '../interfaces';
import { AuthService } from '../services';

describe('FilterPipe', () => {
	let pipe: FilterPipe;
	let authService: AuthService;

	beforeEach(() => {
		authService = {
			checkAccessEdit: jest.fn(),
		} as unknown as AuthService;
		pipe = new FilterPipe(authService);
		(authService.checkAccessEdit as jest.Mock).mockReturnValue(true);
	});

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should return all points if no filters are applied', () => {
		const points: Point[] = [
			{
				title: 'Point 1',
				repeatable: true,
				greenwich: true,
				public: true,
				direction: 'backward',
				color: 'red',
			} as Point,
			{
				title: 'Point 2',
				repeatable: false,
				greenwich: false,
				public: false,
				direction: 'forward',
				color: 'blue',
			} as Point,
		];

		const result = pipe.transform(points, {
			search: '',
			isRepeatable: undefined,
			isGreenwich: undefined,
			isPublic: undefined,
			direction: undefined,
			color: '',
		});

		expect(result).toEqual(points);
	});

	it('should filter points by search term', () => {
		const points: Point[] = [
			{
				title: 'Point 1',
				repeatable: true,
				greenwich: true,
				public: true,
				direction: 'backward',
				color: 'red',
				dates: [
					{
						date: '25.12.1991 00:00',
						reason: 'byHand',
					},
				],
			},
			{
				title: 'Another Point',
				repeatable: false,
				greenwich: false,
				public: false,
				direction: 'forward',
				color: 'blue',
				dates: [
					{
						date: '25.12.1991 00:00',
						reason: 'byHand',
					},
				],
			},
		];

		const result = pipe.transform(points, {
			search: 'Another',
			isRepeatable: 'all',
			isGreenwich: 'all',
			direction: 'all',
			isPublic: 'false',
			color: '',
		});

		expect(result).toEqual([points[1]]);
	});

	it('should filter points by repeatable status', () => {
		const points: Point[] = [
			{
				title: 'Point 1',
				repeatable: true,
				greenwich: true,
				public: true,
				direction: 'backward',
				color: 'red',
				dates: [],
			},
			{
				title: 'Point 2',
				repeatable: false,
				greenwich: false,
				public: false,
				direction: 'forward',
				color: 'blue',
				dates: [],
			},
		];

		const result = pipe.transform(points, {
			search: '',
			isRepeatable: 'true',
			isGreenwich: 'all',
			direction: 'all',
			isPublic: 'false',
			color: '',
		});

		expect(result).toEqual([points[0]]);
	});

	it('should filter points by greenwich status', () => {
		const points: Point[] = [
			{
				title: 'Point 1',
				repeatable: true,
				greenwich: true,
				public: true,
				direction: 'backward',
				color: 'red',
				dates: [],
			},
			{
				title: 'Point 2',
				repeatable: false,
				greenwich: false,
				public: false,
				direction: 'forward',
				color: 'blue',
				dates: [],
			},
		];

		const result = pipe.transform(points, {
			search: '',
			isGreenwich: 'true',
			isRepeatable: 'all',
			direction: 'all',
			isPublic: 'false',
			color: '',
		});

		expect(result).toEqual([points[0]]);
	});

	it('should filter points by public status', () => {
		const points: Point[] = [
			{
				title: 'Point 1',
				repeatable: true,
				greenwich: true,
				public: true,
				direction: 'backward',
				color: 'red',
				dates: [],
			},
			{
				title: 'Point 2',
				repeatable: false,
				greenwich: false,
				public: false,
				direction: 'forward',
				color: 'blue',
				dates: [],
			},
		];

		const result = pipe.transform(points, {
			search: '',
			isPublic: 'true',
			isRepeatable: 'all',
			isGreenwich: 'all',
			direction: 'all',
			color: '',
		});

		expect(result.length).toEqual(2);
	});

	it('should filter points by direction', () => {
		const points: Point[] = [
			{
				title: 'Point 1',
				repeatable: true,
				greenwich: true,
				public: true,
				direction: 'backward',
				color: 'red',
				dates: [],
			},
			{
				title: 'Point 2',
				repeatable: false,
				greenwich: false,
				public: false,
				direction: 'forward',
				color: 'blue',
				dates: [],
			},
		];

		const result = pipe.transform(points, {
			search: '',
			direction: 'backward',
			isRepeatable: 'all',
			isGreenwich: 'all',
			isPublic: 'false',
			color: '',
		});

		expect(result).toEqual([points[0]]);
	});

	it('should filter points by color', () => {
		const points: Point[] = [
			{
				title: 'Point 1',
				repeatable: true,
				greenwich: true,
				public: true,
				direction: 'backward',
				color: 'red',
				dates: [],
			},
			{
				title: 'Point 2',
				repeatable: false,
				greenwich: false,
				public: false,
				direction: 'forward',
				color: 'blue',
				dates: [],
			},
		];

		const result = pipe.transform(points, {
			search: '',
			isRepeatable: 'all',
			isGreenwich: 'all',
			isPublic: 'false',
			direction: 'all',
			color: 'red',
		});

		expect(result).toEqual([points[0]]);
	});

	it('should filter points by multiple criteria', () => {
		const points: Point[] = [
			{
				title: 'Point 1',
				repeatable: true,
				greenwich: true,
				public: true,
				direction: 'backward',
				color: 'red',
			} as Point,
			{
				title: 'Point 2',
				repeatable: false,
				greenwich: false,
				public: false,
				direction: 'forward',
				color: 'blue',
			} as Point,
		];

		const result = pipe.transform(points, {
			search: 'Point',
			isRepeatable: 'true',
			isGreenwich: 'true',
			isPublic: 'false',
			direction: 'backward',
			color: 'red',
		});

		expect(result).toEqual([points[0]]);
	});
});
