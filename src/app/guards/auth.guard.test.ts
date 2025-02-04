import { Router } from '@angular/router';
import { AuthService } from '../services';
import { authGuard } from './auth.guard';
import { TestBed } from '@angular/core/testing';

describe('authGuard', () => {
	let authService: AuthService;
	let router: Router;

	beforeEach(() => {
		const authServiceMock = {
			get token(): string | null {
				if (localStorage.getItem('fb-token')) {
					const expDate = new Date(localStorage.getItem('fb-token-exp') ?? '');
					if (expDate > new Date()) {
						return localStorage.getItem('fb-token');
					} else {
						return null;
					}
				} else {
					return null;
				}
			},
			get isAuthenticated() {
				return !!this.token;
			},
			setToken: jest.fn(),
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

	it('should return false and navigate to home if the user is authenticated', () => {
		localStorage.setItem('fb-token', 'token');
		localStorage.setItem('fb-token-exp', 'Tue Feb 11 2025 00:58:19 GMT+0500 (Екатеринбург, стандартное время)');

		let result: boolean = true;
		TestBed.runInInjectionContext(() => {
			result = authGuard();
		});
		expect(result).toBe(false);
		expect(router.navigate).toHaveBeenCalledWith(['/']);
	});
});
