import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of, Subject, Subscription, throwError } from 'rxjs';
import { AuthService, DataService } from '../services';
import { readGuard } from './read.guard';
import { ActivationEnd } from '@angular/router';
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

describe('readGuard', () => {
	let dataServiceMock: jest.Mocked<DataService>;
	let authServiceMock: jest.Mocked<AuthService>;

	let router: Router;

	beforeEach(() => {
		dataServiceMock = {
			putPoint: jest.fn(),
			eventAddPoint$: new Subject(),
			eventEditPoint$: new Subject(),
			fetchPoint: jest.fn(() => of(mockPoint)),
		} as unknown as jest.Mocked<DataService>;

		authServiceMock = {
			getUserData: jest.fn(),
			eventEditAccessCheck$: new BehaviorSubject({ pointId: null, access: true }),
			checkAccessEdit: jest.fn(),
		} as unknown as jest.Mocked<AuthService>;

		const routerMock = {
			events: of(
				new ActivationEnd({
					params: { id: '123' },
				} as any),
			),
			navigate: jest.fn(),
		};

		TestBed.configureTestingModule({
			providers: [
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: DataService, useValue: dataServiceMock },
				{ provide: Router, useValue: routerMock },
			],
		});

		router = TestBed.inject(Router);
	});

	it('should allow access if user has edit rights', () => {
		dataServiceMock.fetchPoint.mockReturnValue(of(mockPoint));
		authServiceMock.checkAccessEdit.mockReturnValue(true);

		let result: Subscription = of().subscribe();
		TestBed.runInInjectionContext(() => {
			result = readGuard();
		});

		expect(router.navigate).not.toHaveBeenCalled();
	});

	it('should allow access if point is public', () => {
		dataServiceMock.fetchPoint.mockReturnValue(of(mockPoint));
		authServiceMock.checkAccessEdit.mockReturnValue(true);

		let result: Subscription = of().subscribe();
		TestBed.runInInjectionContext(() => {
			result = readGuard();
		});

		expect(router.navigate).not.toHaveBeenCalled();
	});

	it('should deny access and navigate if conditions are not met', () => {
		dataServiceMock.fetchPoint.mockReturnValue(of(mockPoint));
		authServiceMock.checkAccessEdit.mockReturnValue(false);

		let result: Subscription = of().subscribe();
		TestBed.runInInjectionContext(() => {
			result = readGuard();
		});

		expect(router.navigate).toHaveBeenCalledWith(['/']);
	});

	it('should handle errors and navigate away', () => {
		dataServiceMock.fetchPoint.mockReturnValue(throwError(() => new Error('Fetch error')));

		console.error = jest.fn();

		let result: Subscription = of().subscribe();
		TestBed.runInInjectionContext(() => {
			result = readGuard();
		});

		expect(router.navigate).toHaveBeenCalledWith(['/']);
		expect(console.error).toHaveBeenCalledWith('Ошибка доступа к просмотру события:\n', 'Fetch error');
	});
});
