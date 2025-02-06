import { CheckAccessEditPipe } from './check-access-edit.pipe';
import { AuthService } from '../services';
import { Point } from '../interfaces';

describe('CheckAccessEditPipe', () => {
	let pipe: CheckAccessEditPipe;
	let authService: AuthService;

	beforeEach(() => {
		authService = {
			checkAccessEdit: jest.fn(),
		} as unknown as AuthService;
		pipe = new CheckAccessEditPipe(authService);
	});

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should return true if user has access to edit the point', () => {
		const point: Point = { user: 'user1' } as Point;
		(authService.checkAccessEdit as jest.Mock).mockReturnValue(true);

		expect(pipe.transform(point)).toBe(true);
		expect(authService.checkAccessEdit).toHaveBeenCalledWith(point);
	});

	it('should return false if user does not have access to edit the point', () => {
		const point: Point = { user: 'user1' } as Point;
		(authService.checkAccessEdit as jest.Mock).mockReturnValue(false);

		expect(pipe.transform(point)).toBe(false);
		expect(authService.checkAccessEdit).toHaveBeenCalledWith(point);
	});
});
