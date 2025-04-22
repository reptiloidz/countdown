import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DataService, ActionService, NotifyService, AuthService, HttpService } from 'src/app/services';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { Iteration, Point } from 'src/app/interfaces';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EditPointEvent } from 'src/app/types';

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

describe('FooterComponent', () => {
	let component: FooterComponent;
	let fixture: ComponentFixture<FooterComponent>;
	let router: Router;
	let route: ActivatedRoute;
	let dataServiceMock: jest.Mocked<DataService>;
	let authServiceMock: jest.Mocked<AuthService>;
	let actionServiceMock: jest.Mocked<ActionService>;
	let notifyServiceMock: jest.Mocked<NotifyService>;
	let httpServiceMock: jest.Mocked<HttpService>;

	beforeEach(async () => {
		dataServiceMock = {
			putPoint: jest.fn(),
			editPoint: jest.fn(),
			removePoints: jest.fn(),
			eventAddPoint$: new Subject(),
			eventEditPoint$: new Subject(),
			eventRemovePoint$: new Subject(),
			fetchPoint: jest.fn(() => of(mockPoint)),
			setDateNow: jest.fn(),
		} as unknown as jest.Mocked<DataService>;

		authServiceMock = {
			isAuthenticated: true,
			checkEmailVerified: true,
			checkAccessEdit: jest.fn().mockReturnValue(true),
			getUserData: jest.fn(),
			eventEditAccessCheck$: new BehaviorSubject({ pointId: null, access: true }),
		} as unknown as jest.Mocked<AuthService>;

		actionServiceMock = {
			eventPointsChecked$: new Subject(),
			eventHasEditablePoints$: new Subject(),
			eventUpdatedPoint$: new BehaviorSubject(mockPoint),
			hasEditablePoints: jest.fn(),
			checkAllPoints: jest.fn(),
			uncheckAllPoints: jest.fn(),
			pointUpdated: jest.fn().mockReturnValue(mockPoint),
		} as unknown as jest.Mocked<ActionService>;

		notifyServiceMock = {
			add: jest.fn(),
			close: jest.fn(),
			confirm: jest.fn().mockReturnValue(of(true)),
		} as unknown as jest.Mocked<NotifyService>;

		httpServiceMock = {
			getShortLink: jest.fn().mockReturnValue(of('shortLink')),
			postShortLink: jest.fn().mockReturnValue(of({ short: 'shortLink' })),
		} as unknown as jest.Mocked<HttpService>;

		await TestBed.configureTestingModule({
			declarations: [FooterComponent, TooltipComponent],
			providers: [
				{
					provide: Router,
					useValue: {
						navigate: jest.fn(),
						events: new Subject(),
						lastSuccessfulNavigation: {
							finalUrl: {
								root: {
									children: {
										primary: {
											segments: [{ path: 'edit' }, { path: '1' }],
										},
									},
								},
							},
						},
					},
				},
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: { params: { id: '1' } },
						queryParams: of({ iteration: '1' }),
						url: of([{ path: 'edit' }]),
						params: of({ id: 'someId' }), // добавлено значение для params
					},
				},
				{
					provide: DataService,
					useValue: dataServiceMock,
				},
				{
					provide: ActionService,
					useValue: actionServiceMock,
				},
				{
					provide: NotifyService,
					useValue: notifyServiceMock,
				},
				{
					provide: AuthService,
					useValue: authServiceMock,
				},
				{
					provide: HttpService,
					useValue: httpServiceMock,
				},
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		router = TestBed.inject(Router);
		route = TestBed.inject(ActivatedRoute);

		fixture = TestBed.createComponent(FooterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should initialize with default values', () => {
			component.ngOnInit();

			expect(component.isEdit).toBeFalsy();
			expect(component.isCreate).toBeFalsy();
			expect(component.isCreateUrl).toBeFalsy();
			expect(component.isUrl).toBeFalsy();
			expect(component.isTimer).toBeFalsy();
			expect(component.isMain).toBeFalsy();
			expect(component.hasAccess).toBeFalsy();
			expect(component.pointsChecked).toBeFalsy();
			expect(component.iteration).toBe(0);
			expect(component.exportGoogleLink).toBe('');
			expect(component.hasEditablePoints).toBeFalsy();
			expect(component.shareLinkLoading).toBeFalsy();
		});

		it('should fetch point and set properties', () => {
			dataServiceMock.fetchPoint = jest.fn().mockReturnValue(of(mockPoint));
			jest.spyOn(dataServiceMock, 'fetchPoint');
			const event = new NavigationEnd(1, '/point/0/', '/point/1/');

			(router.events as Subject<NavigationEnd>).next(event);

			expect(dataServiceMock.fetchPoint).toHaveBeenCalledWith('1');
			expect(component.point).toEqual(mockPoint);
			expect(component.hasAccess).toBeTruthy();
		});
	});

	it('should update point when pointUpdated is called', () => {
		const updatedPoint: Point = { ...mockPoint, title: 'updated title' };

		jest.spyOn(actionServiceMock, 'pointUpdated').mockImplementation(point => {
			(actionServiceMock.eventUpdatedPoint$ as Subject<Point | undefined>).next(point);
		});

		actionServiceMock.pointUpdated(updatedPoint);

		expect(component.point).toEqual(updatedPoint);
		expect(actionServiceMock.pointUpdated).toHaveBeenCalledWith(updatedPoint);
	});

	it('should handle edit point events', () => {
		const newPoint = { ...mockPoint, title: 'new title' };

		jest.spyOn(dataServiceMock, 'editPoint').mockImplementation(point => {
			(dataServiceMock.eventEditPoint$ as Subject<[Point, EditPointEvent, Iteration?]>).next([newPoint, 'pointEdited']);
		});

		dataServiceMock.editPoint('1', newPoint);

		expect(component.point).toEqual(newPoint);
	});

	it('should handle remove point events', () => {
		jest.spyOn(router, 'navigate');
		jest.spyOn(dataServiceMock, 'removePoints').mockImplementation(point => {
			(dataServiceMock.eventRemovePoint$ as Subject<string | undefined>).next(point?.id);
		});

		dataServiceMock.removePoints({ id: '1' });

		expect(router.navigate).toHaveBeenCalledWith(['']);
		expect(notifyServiceMock.add).toHaveBeenCalledWith({
			title: 'Событие удалено',
			view: 'positive',
			short: true,
		});
	});

	it('should handle points checked events', () => {
		jest.spyOn(actionServiceMock, 'checkAllPoints').mockImplementation(() => {
			(actionServiceMock.eventPointsChecked$ as Subject<boolean>).next(true);
		});
		component.checkAllPoints();

		expect(component.pointsChecked).toBeTruthy();
	});

	it('should handle has editable points events', () => {
		jest.spyOn(actionServiceMock, 'hasEditablePoints').mockImplementation(() => {
			(actionServiceMock.eventHasEditablePoints$ as Subject<boolean>).next(true);
		});
		actionServiceMock.hasEditablePoints(true);

		expect(component.hasEditablePoints).toBeTruthy();
	});

	describe('ngOnDestroy', () => {
		it('should unsubscribe from all subscriptions', () => {
			const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');

			component.ngOnDestroy();

			expect(unsubscribeSpy).toHaveBeenCalled();
		});
	});

	describe('setDateNow', () => {
		it('should call setDateNow on data service', () => {
			component.point = mockPoint;
			component.setDateNow();

			expect(notifyServiceMock.confirm).toHaveBeenCalled();
			expect(dataServiceMock.setDateNow).toHaveBeenCalledWith(mockPoint);
		});
	});

	describe('checkAllPoints', () => {
		it('should call checkAllPoints on action service', () => {
			component.checkAllPoints();

			expect(actionServiceMock.checkAllPoints).toHaveBeenCalled();
		});
	});

	describe('uncheckAllPoints', () => {
		it('should call uncheckAllPoints on action service', () => {
			component.uncheckAllPoints();

			expect(actionServiceMock.uncheckAllPoints).toHaveBeenCalled();
		});
	});

	describe('removeAllCheckedPoints', () => {
		it('should call removePoints on data service', () => {
			component.removeAllCheckedPoints();

			expect(dataServiceMock.removePoints).toHaveBeenCalled();
		});
	});

	describe('removePoint', () => {
		it('should call removePoints on data service with point id', () => {
			component.point = mockPoint;
			component.removePoint();

			expect(dataServiceMock.removePoints).toHaveBeenCalledWith({ id: mockPoint.id });
		});
	});

	describe('share', () => {
		it('should copy link if pointId is present', () => {
			const writeTextMock = jest.fn().mockResolvedValue(undefined);
			Object.defineProperty(navigator, 'clipboard', {
				value: { writeText: writeTextMock },
				configurable: true,
			});
			jest.spyOn(component, 'copyLink');
			component.pointId = '1';
			component.share();

			expect(component.copyLink).toHaveBeenCalledWith('1');
		});

		it('should get short link if pointId is not present', () => {
			jest.spyOn(component, 'copyLink');
			component.pointId = '';
			component.share();

			expect(httpServiceMock.getShortLink).toHaveBeenCalled();
		});
	});

	describe('copyLink', () => {
		it('should copy link to clipboard', async () => {
			const writeTextMock = jest.fn().mockResolvedValue(undefined);
			Object.defineProperty(navigator, 'clipboard', {
				value: { writeText: writeTextMock },
				configurable: true,
			});

			if (mockPoint.id) {
				component.pointId = mockPoint.id;
				await component.copyLink(mockPoint.id);
				expect(writeTextMock).toHaveBeenCalledWith(window.location.origin + '/point/' + mockPoint.id);
				expect(notifyServiceMock.add).toHaveBeenCalledWith({
					title: 'URL события успешно скопирован в&nbsp;буфер обмена',
					text: window.location.origin + '/point/' + mockPoint.id,
					short: true,
					view: 'positive',
				});
			}
		});
	});

	describe('copyPoint', () => {
		it('should navigate to create and update point', async () => {
			component.point = mockPoint;

			// Мокаем зависимости
			jest.spyOn(router, 'navigate').mockResolvedValue(true);
			jest.spyOn(actionServiceMock, 'pointUpdated').mockImplementation();

			// Вызываем метод
			await component.copyPoint();
			// Проверяем вызовы
			expect(router.navigate).toHaveBeenCalledWith(['/create-url/']);
			expect(actionServiceMock.pointUpdated).toHaveBeenCalledWith({
				...mockPoint,
				dates: mockPoint.dates,
				repeatable: false,
				public: false,
				greenwich: false,
			});
		});

		it('should navigate to create and update point-timer', async () => {
			component.point = mockPoint;
			component.point.dates = [{ date: '15.01.2025 12:25:00', reason: 'byHand' }];
			component.isTimer = true;
			component.isUrl = true;

			// Мокаем зависимости
			jest.spyOn(router, 'navigate').mockResolvedValue(true);
			jest.spyOn(actionServiceMock, 'pointUpdated').mockImplementation();

			// Вызываем метод
			await component.copyPoint();
			// Проверяем вызовы
			expect(router.navigate).toHaveBeenCalledWith(['/create-url/']);
			expect(actionServiceMock.pointUpdated).toHaveBeenCalledWith({
				...mockPoint,
				dates: mockPoint.dates,
				repeatable: false,
				public: false,
				greenwich: false,
			});
		});
	});
});
