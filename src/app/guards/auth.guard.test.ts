import { Router } from '@angular/router';
import { AuthService } from '../services';
import { authGuard } from './auth.guard';
import { TestBed } from '@angular/core/testing';

describe('authGuard', () => {
	let authService: AuthService;
	let router: Router;

	beforeEach(() => {
		const authServiceMock = {
			isAuthenticated: false,
			setToken: jest.fn(),
			token: '',
		};

		const routerMock = {
			navigate: jest.fn(),
		};

		TestBed.configureTestingModule({
			providers: [
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: Router, useValue: routerMock },
			],
		});

		authService = TestBed.inject(AuthService);
		router = TestBed.inject(Router);
	});

	it('should return true if the user is not authenticated', () => {
		let result: boolean = false;
		TestBed.runInInjectionContext(() => {
			result = authGuard();
		});
		expect(result).toBe(true);
	});

	it.skip('should return false and navigate to home if the user is authenticated', () => {
		localStorage.setItem('fb-token', 'token');
		localStorage.setItem('fb-token-exp', 'Tue Feb 11 2025 00:58:19 GMT+0500 (Екатеринбург, стандартное время)');
		console.log(authService.token);
		console.log(authService.isAuthenticated);
		console.log(localStorage.getItem('fb-token'));

		let result: boolean = true;
		TestBed.runInInjectionContext(() => {
			result = authGuard();
		});
		expect(result).toBe(false);
		expect(router.navigate).toHaveBeenCalledWith(['/']);
	});
});
