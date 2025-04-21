import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { NotifyService, HttpService, ActionService } from '.';
import { jest } from '@jest/globals';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Point } from '../interfaces';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const mockPoint: Point = {
	id: '1',
	dates: [
		{
			date: '15.01.2025 12:25',
			reason: 'byHand',
		},
		{
			date: '20.01.2025 16:40',
			reason: 'frequency',
		},
	],
	repeatable: true,
	greenwich: false,
	color: 'red',
	direction: 'backward',
	title: 'title',
};

jest.mock('../services/http.service');
jest.mock('@angular/router');
jest.mock('../services/action.service');
jest.mock('../services/notify.service');

describe('AuthService', () => {
	let service: AuthService;
	let httpServiceMock: jest.Mocked<HttpService>;
	let routerMock: Router;
	let actionServiceMock: jest.Mocked<ActionService>;
	let notifyServiceMock: jest.Mocked<NotifyService>;

	beforeEach(() => {
		const authServiceMock = {
			currentUser: jest.fn(),
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
			setToken: function (tokenObj?: { token?: string; id?: string }) {
				if (tokenObj && tokenObj.token && tokenObj.id) {
					localStorage.setItem('fb-token', tokenObj.token);
					localStorage.setItem('fb-uid', tokenObj.id);
					const expDate = new Date();
					expDate.setDate(expDate.getDate() + 1);
					localStorage.setItem('fb-token-exp', expDate.toString());
				} else {
					localStorage.removeItem('fb-token');
					localStorage.removeItem('fb-uid');
					localStorage.removeItem('fb-token-exp');
				}
			},
			get checkEmailVerified() {
				return true;
			},
			verifyEmail: jest.fn(),
		};
		httpServiceMock = {
			getShortLink: jest.fn().mockReturnValue(of('shortLink')),
			postShortLink: jest.fn().mockReturnValue(of({ short: 'shortLink' })),
		} as unknown as jest.Mocked<HttpService>;
		routerMock = {
			navigate: jest.fn(),
		} as unknown as Router;
		actionServiceMock = {
			eventPointsChecked$: new Subject(),
			eventHasEditablePoints$: new Subject(),
			eventUpdatedPoint$: new BehaviorSubject(mockPoint),
			hasEditablePoints: jest.fn(),
			checkAllPoints: jest.fn(),
			uncheckAllPoints: jest.fn(),
			pointUpdated: jest.fn().mockReturnValue(mockPoint),
			shortLinkChecked: jest.fn(),
		} as unknown as jest.Mocked<ActionService>;
		notifyServiceMock = {
			add: jest.fn(),
			close: jest.fn(),
			confirm: jest.fn().mockReturnValue(of(true)),
		} as unknown as jest.Mocked<NotifyService>;

		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(withInterceptorsFromDi()),
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: HttpService, useValue: httpServiceMock },
				{ provide: ActionService, useValue: actionServiceMock },
				{ provide: NotifyService, useValue: notifyServiceMock },
				{ provide: Router, useValue: routerMock },
				provideFirebaseApp(() => initializeApp()),
			],
		});
		service = TestBed.inject(AuthService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should check authentication', () => {
		localStorage.setItem('fb-token', 'token');
		localStorage.setItem('fb-token-exp', 'Tue Feb 11 2125 00:58:19 GMT+0500 (Екатеринбург, стандартное время)');
		expect(service.isAuthenticated).toBe(true);
	});

	it('should log out the user', async () => {
		localStorage.clear();
		expect(service.isAuthenticated).toBe(false);
	});

	it('should trigger email verification', async () => {
		const mockUser = { emailVerified: false, email: 'test@example.com' };
		jest.spyOn(service, 'checkEmailVerified', 'get').mockReturnValue(false);
		jest.spyOn(service, 'verifyEmail');

		service.verifyEmail(mockUser as any);

		expect(service.verifyEmail).toHaveBeenCalled();
	});

	it('should return null token if expired', () => {
		localStorage.setItem('fb-token', 'token');
		localStorage.setItem('fb-token-exp', 'Tue Feb 11 2000 00:00:00 GMT+0500');
		expect(service.token).toBeNull();
	});

	it('should return null token if no token in localStorage', () => {
		localStorage.removeItem('fb-token');
		localStorage.removeItem('fb-token-exp');
		expect(service.token).toBeNull();
	});

	it('should set token in localStorage', () => {
		const mockToken = { token: 'test-token', id: 'test-id' };
		service.setToken(mockToken);

		// Проверка, что токен сохранён
		expect(localStorage.getItem('fb-token')).toBe('test-token');

		// Проверка, что id сохранён
		expect(localStorage.getItem('fb-uid')).toBe('test-id');

		// Проверка, что дата истечения токена сохранена
		const exp = localStorage.getItem('fb-token-exp');
		expect(exp).toBeTruthy(); // проверяем, что дата существует
		expect(new Date(exp!).getTime()).toBeGreaterThan(Date.now()); // проверка, что дата в будущем
	});

	it('should clear localStorage when no token or id is provided', () => {
		service.setToken(); // без параметров

		expect(localStorage.getItem('fb-token')).toBeNull();
		expect(localStorage.getItem('fb-uid')).toBeNull();
		expect(localStorage.getItem('fb-token-exp')).toBeNull();
	});

	it('should not call verifyEmail if already verified', () => {
		const mockUser = { emailVerified: true };
		const verifySpy = jest.spyOn(service, 'verifyEmail');

		service.verifyEmail(mockUser as any);

		expect(verifySpy).toHaveBeenCalledWith(mockUser);
	});

	it('should call verifyEmail if not verified', () => {
		const mockUser = { emailVerified: false };
		const verifySpy = jest.spyOn(service, 'verifyEmail');

		service.verifyEmail(mockUser as any);

		expect(verifySpy).toHaveBeenCalledWith(mockUser);
	});
});
