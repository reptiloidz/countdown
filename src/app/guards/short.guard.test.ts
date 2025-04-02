import { shortGuard } from './short.guard';
import { HttpService } from '../services/http.service';
import { Router } from '@angular/router';
import { ActionService } from '../services/action.service';
import { NotifyService } from '../services/notify.service';
import { BehaviorSubject, of, Subject, Subscription, throwError } from 'rxjs';
import { Point } from '../interfaces';
import { TestBed } from '@angular/core/testing';

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

describe('shortGuard', () => {
	let httpServiceMock: jest.Mocked<HttpService>;
	let routerMock: Router;
	let actionServiceMock: jest.Mocked<ActionService>;
	let notifyServiceMock: jest.Mocked<NotifyService>;

	beforeEach(() => {
		// Моки для сервисов
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
				{ provide: HttpService, useValue: httpServiceMock },
				{ provide: ActionService, useValue: actionServiceMock },
				{ provide: NotifyService, useValue: notifyServiceMock },
				{ provide: Router, useValue: routerMock },
			],
		});

		// Обновляем зависимости для каждого теста
		jest.clearAllMocks();
	});

	it('should navigate with queryParams if link exists', () => {
		// Создание ссылки с параметрами
		const link = 'param1=value1&param2=value2';
		const url = new URL('https://example.com?' + link);
		const queryParams = Object.fromEntries(url.searchParams.entries());

		httpServiceMock.getFullLink = jest.fn().mockReturnValue(of(link));

		const navigateSpy = jest.spyOn(routerMock, 'navigate');

		// Запуск Guard
		let result: boolean = false;
		TestBed.runInInjectionContext(() => {
			result = shortGuard() as unknown as boolean;
		});
		expect(navigateSpy).toHaveBeenCalledWith(['/url/'], {
			queryParams: queryParams,
			'replaceUrl': true,
		});
	});

	it('should call notify and actionService when an error occurs', () => {
		httpServiceMock.getFullLink = jest.fn().mockReturnValue(throwError(() => new Error('Error')));

		const addSpy = jest.spyOn(notifyServiceMock, 'add');
		const actionSpy = jest.spyOn(actionServiceMock, 'shortLinkChecked');

		// Запуск Guard
		const subscription: Subscription = TestBed.runInInjectionContext(() => shortGuard());

		// Проверяем, что вызывается notify с нужными параметрами
		expect(addSpy).toHaveBeenCalledWith({
			view: 'negative',
			short: true,
			title: 'Нет такой ссылки, даже короткой.',
		});

		// Проверяем, что вызывается метод shortLinkChecked
		expect(actionSpy).toHaveBeenCalled();

		// Отписываемся
		subscription.unsubscribe();
	});
});
