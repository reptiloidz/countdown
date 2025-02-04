import { TestBed } from '@angular/core/testing';
import { Router, ActivationEnd } from '@angular/router';
import { of, Subscription, throwError } from 'rxjs';
import { AuthService, DataService } from '../services';
import { editGuard } from './edit.guard';
import { Point } from '../interfaces';

const mockPoint = {
	id: '123',
	title: 'Test point',
	color: 'red',
	dates: [{ date: '01.01.2023', reason: 'byHand' }],
	direction: 'backward',
	greenwich: false,
	repeatable: false,
} as Point;

describe('editGuard', () => {
	let authService: jest.Mocked<AuthService>;
	let dataService: jest.Mocked<DataService>;
	let router: jest.Mocked<Router>;

	beforeEach(() => {
		authService = {
			checkAccessEdit: jest.fn(),
			get checkEmailVerified() {
				return false;
			},
			setEditPointAccess: jest.fn(),
		} as unknown as jest.Mocked<AuthService>;

		dataService = {
			fetchPoint: jest.fn(),
		} as unknown as jest.Mocked<DataService>;

		router = {
			navigate: jest.fn(),
			events: of(new ActivationEnd({ params: { id: '123' } } as any)),
		} as unknown as jest.Mocked<Router>;

		TestBed.configureTestingModule({
			providers: [
				{ provide: AuthService, useValue: authService },
				{ provide: DataService, useValue: dataService },
				{ provide: Router, useValue: router },
			],
		});
	});

	it('should allow access if checkAccessEdit returns true', () => {
		dataService.fetchPoint.mockReturnValue(of(mockPoint));
		authService.checkAccessEdit.mockReturnValue(true);
		let result: Subscription = of().subscribe();
		TestBed.runInInjectionContext(() => {
			result = editGuard();
		});
		expect(authService.setEditPointAccess).toHaveBeenCalledWith('123', true);
	});

	it('should deny access and navigate away if checkAccessEdit returns false', () => {
		dataService.fetchPoint.mockReturnValue(of(mockPoint));
		authService.checkAccessEdit.mockReturnValue(false);
		let result: Subscription = of().subscribe();
		TestBed.runInInjectionContext(() => {
			result = editGuard();
		});
		expect(router.navigate).toHaveBeenCalledWith(['/point/', '123']);
		expect(authService.setEditPointAccess).toHaveBeenCalledWith('123', false);
	});

	it('should navigate to root if point is undefined', () => {
		dataService.fetchPoint.mockReturnValue(of(undefined));
		authService.checkAccessEdit.mockReturnValue(false);
		let result: Subscription = of().subscribe();
		TestBed.runInInjectionContext(() => {
			result = editGuard();
		});
		expect(router.navigate).toHaveBeenCalledWith(['/']);
	});

	it('should log an error if fetchPoint fails', () => {
		console.error = jest.fn();
		dataService.fetchPoint.mockReturnValue(throwError(() => new Error('Test error')));
		let result: Subscription = of().subscribe();
		TestBed.runInInjectionContext(() => {
			result = editGuard();
		});
		expect(console.error).toHaveBeenCalledWith('Ошибка при проверке доступа к редактированию события:\n', 'Test error');
	});
});
