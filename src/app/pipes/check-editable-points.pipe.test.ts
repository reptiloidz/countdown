import { CheckEditablePointsPipe } from './check-editable-points.pipe';
import { AuthService } from '../services';
import { Point } from '../interfaces';

describe('CheckEditablePointsPipe', () => {
	let pipe: CheckEditablePointsPipe;
	let authService: AuthService;

	beforeEach(() => {
		authService = {
			checkAccessEdit: jest.fn(),
		} as unknown as AuthService;
		pipe = new CheckEditablePointsPipe(authService);
	});

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should return true if at least one point is editable', () => {
		const points: Point[] = [
			{
				id: '1',
				title: 'Test point 1',
				color: 'red',
				dates: [{ date: '01.01.2023 00:00', reason: 'byHand' }],
				direction: 'backward',
				greenwich: true,
				repeatable: false,
				user: 'user1',
			},
			{
				id: '2',
				title: 'Test point 2',
				color: 'red',
				dates: [{ date: '01.01.2023 00:00', reason: 'byHand' }],
				direction: 'backward',
				greenwich: true,
				repeatable: false,
				user: 'user2',
			},
		];
		(authService.checkAccessEdit as jest.Mock).mockImplementation((point: Point) => point.user === 'user1');

		expect(pipe.transform(points)).toBe(true);
		expect(authService.checkAccessEdit).toHaveBeenCalled();
	});

	it('should return false if no points are editable', () => {
		const points: Point[] = [{ user: 'user1' } as Point, { user: 'user2' } as Point];
		(authService.checkAccessEdit as jest.Mock).mockReturnValue(false);

		expect(pipe.transform(points)).toBe(false);
		expect(authService.checkAccessEdit).toHaveBeenCalledWith(points[0]);
		expect(authService.checkAccessEdit).toHaveBeenCalledWith(points[1]);
	});

	it('should return false if points array is empty', () => {
		const points: Point[] = [];
		expect(pipe.transform(points)).toBe(false);
		expect(authService.checkAccessEdit).not.toHaveBeenCalled();
	});
});
