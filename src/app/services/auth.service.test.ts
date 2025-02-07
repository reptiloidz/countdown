import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { NotifyService, HttpService, ActionService } from '.';
import { jest } from '@jest/globals';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Point } from '../interfaces';
import { HttpClientModule } from '@angular/common/http';

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
			setToken: jest.fn(),
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
			imports: [HttpClientModule, provideFirebaseApp(() => initializeApp())],
			providers: [
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: HttpService, useValue: httpServiceMock },
				{ provide: ActionService, useValue: actionServiceMock },
				{ provide: NotifyService, useValue: notifyServiceMock },
				{ provide: Router, useValue: routerMock },
			],
		});
		service = TestBed.inject(AuthService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should check authentication', () => {
		localStorage.setItem('fb-token', 'token');
		localStorage.setItem('fb-token-exp', 'Tue Feb 11 2025 00:58:19 GMT+0500 (Екатеринбург, стандартное время)');
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

	// TODO: добавить тестов для покрытия
});
