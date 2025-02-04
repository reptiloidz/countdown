import { shortGuard } from './short.guard';
import { Router } from '@angular/router';
import { BehaviorSubject, of, Subscription, throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { Auth, getAuth, provideAuth } from '@angular/fire/auth';
import { AuthService, ActionService, NotifyService, HttpService } from '../services';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';

// jest.mock('../services/http.service');
// jest.mock('@angular/router');
// jest.mock('../services/action.service');
// jest.mock('../services/notify.service');

const mockDate = new Date();

describe.skip('shortGuard', () => {
	let actionServiceMock: jest.Mocked<ActionService>;
	let notifyServiceMock: jest.Mocked<NotifyService>;
	let routerMock: Router;
	let httpServiceMock: jest.Mocked<HttpService>;
	let authServiceMock: jest.Mocked<AuthService>;

	beforeEach(() => {
		// Моки для сервисов
		httpServiceMock = {
			getShortLink: jest.fn().mockReturnValue(of('shortLink')),
			postShortLink: jest.fn().mockReturnValue(of({ short: 'shortLink' })),
		} as unknown as jest.Mocked<HttpService>;

		actionServiceMock = {
			pointUpdated: jest.fn(),
			shortLinkChecked: jest.fn(),
		} as unknown as jest.Mocked<ActionService>;

		notifyServiceMock = {
			add: jest.fn(() => mockDate),
			close: jest.fn(),
		} as unknown as jest.Mocked<NotifyService>;

		const mockAuth = {
			currentUser: {
				uid: 'test-user',
				displayName: 'Test User',
				email: 'test@example.com',
				photoURL: 'url',
			},
			signInWithEmailAndPassword: jest.fn(),
			signOut: jest.fn(),
			authState: of({
				uid: 'test-user-id',
				email: 'test@example.com',
				displayName: 'Test User',
			}),
			db: jest.fn(),
		};

		authServiceMock = {
			getUserData: jest.fn(),
			eventEditAccessCheck$: new BehaviorSubject({ pointId: null, access: true }),
			isAuthenticated: true,
			checkEmailVerified: true,
			checkAccessEdit: jest.fn().mockReturnValue(true),
		} as unknown as jest.Mocked<AuthService>;

		TestBed.configureTestingModule({
			providers: [
				{ provide: Auth, useValue: mockAuth },
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: provideAuth, useFactory: () => getAuth() },
				{ provide: provideDatabase, useValue: () => getDatabase() },
				{ provide: provideFirebaseApp, useValue: () => initializeApp({}) },
			],
		}).compileComponents();

		routerMock = TestBed.inject(Router);

		// Обновляем зависимости для каждого теста
		jest.clearAllMocks();
	});

	it('should navigate with queryParams if link exists', () => {
		// Создание ссылки с параметрами
		const link = 'https://example.com?param1=value1&param2=value2';
		httpServiceMock.getFullLink = jest.fn().mockReturnValue(of(link));

		const navigateSpy = jest.spyOn(routerMock, 'navigate');

		let result: Subscription = of().subscribe();
		TestBed.runInInjectionContext(() => {
			result = shortGuard();
		});

		// Проверяем, что navigate был вызван с правильными параметрами
		expect(navigateSpy).toHaveBeenCalledWith(['/url/'], {
			queryParams: { param1: 'value1', param2: 'value2' },
		});
	});

	it('should return false if link exists and navigate is called', () => {
		const link = 'https://example.com?param1=value1';
		httpServiceMock.getFullLink = jest.fn().mockReturnValue(of(link));

		// Тестируем результат работы Guard
		let result: Subscription = of().subscribe();
		TestBed.runInInjectionContext(() => {
			result = shortGuard();
		});
		expect(result).toBe(false);
	});

	it('should call notify and actionService when an error occurs', () => {
		httpServiceMock.getFullLink = jest.fn().mockReturnValue(throwError('Error'));

		const addSpy = jest.spyOn(notifyServiceMock, 'add');
		const actionSpy = jest.spyOn(actionServiceMock, 'shortLinkChecked');

		let result: Subscription = of().subscribe();
		TestBed.runInInjectionContext(() => {
			result = shortGuard();
		});

		// Проверяем, что вызывается notify с нужными параметрами
		expect(addSpy).toHaveBeenCalledWith({
			view: 'negative',
			short: true,
			title: 'Нет такой ссылки, даже короткой.',
		});

		// Проверяем, что вызывается метод shortLinkChecked
		expect(actionSpy).toHaveBeenCalled();
	});

	it('should return true if link does not exist', () => {
		httpServiceMock.getFullLink = jest.fn().mockReturnValue(of(''));

		let result: Subscription = of().subscribe();
		TestBed.runInInjectionContext(() => {
			result = shortGuard();
		});

		// Проверяем, что guard возвращает true, если ссылки нет
		expect(result).toBe(true);
	});
});
