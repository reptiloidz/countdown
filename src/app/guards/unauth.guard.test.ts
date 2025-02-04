import { unauthGuard } from './unauth.guard'; // Путь к вашему guard
import { AuthService } from '../services';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

jest.mock('../services', () => ({
	AuthService: jest.fn().mockImplementation(() => ({
		isAuthenticated: false, // Начальное значение
	})),
}));

jest.mock('@angular/router', () => ({
	Router: jest.fn().mockImplementation(() => ({
		navigate: jest.fn(), // Мокаем метод navigate
	})),
}));

describe('unauthGuard', () => {
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

	it('должен вернуть false, если пользователь не аутентифицирован', () => {
		let result: boolean = false;
		TestBed.runInInjectionContext(() => {
			result = unauthGuard();
		});
		expect(result).toBe(false);
	});

	it('должен вернуть true, если пользователь аутентифицирован', () => {
		localStorage.setItem('fb-token', 'token');
		localStorage.setItem('fb-token-exp', 'Tue Feb 11 2025 00:58:19 GMT+0500 (Екатеринбург, стандартное время)');
		let result: boolean = true;
		TestBed.runInInjectionContext(() => {
			result = unauthGuard();
		});
		expect(result).toBe(true);
	});
});
