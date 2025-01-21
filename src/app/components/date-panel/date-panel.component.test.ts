import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePanelComponent } from './date-panel.component';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService, ActionService, NotifyService, AuthService } from 'src/app/services';
import { of, Subject } from 'rxjs';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { Point } from 'src/app/interfaces';
import { PanelComponent } from '../panel/panel.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonComponent } from '../button/button.component';

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

describe('DatePanelComponent', () => {
	let component: DatePanelComponent;
	let fixture: ComponentFixture<DatePanelComponent>;
	let router: Router;
	let route: ActivatedRoute;
	let dataService: DataService;
	let actionService: ActionService;
	let notifyService: NotifyService;
	let authService: AuthService;
	let cdr: ChangeDetectorRef;

	beforeEach(async () => {
		(window as any).ResizeObserver = jest.fn(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		}));

		await TestBed.configureTestingModule({
			declarations: [DatePanelComponent, PanelComponent, ButtonComponent],
			imports: [BrowserAnimationsModule],
			providers: [
				{ provide: Router, useValue: { navigate: jest.fn() } },
				{ provide: ActivatedRoute, useValue: { queryParams: of({ iteration: '1' }) } },
				{
					provide: DataService,
					useValue: {
						eventEditPoint$: new Subject(),
						editPoint: jest.fn(),
					},
				},
				{
					provide: ActionService,
					useValue: {
						eventUpdatedPoint$: new Subject(),
						pointUpdated: jest.fn(),
					},
				},
				{ provide: NotifyService, useValue: { confirm: jest.fn() } },
				{ provide: AuthService, useValue: { checkAccessEdit: jest.fn() } },
				ChangeDetectorRef,
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		router = TestBed.inject(Router);
		route = TestBed.inject(ActivatedRoute);
		dataService = TestBed.inject(DataService);
		actionService = TestBed.inject(ActionService);
		notifyService = TestBed.inject(NotifyService);
		authService = TestBed.inject(AuthService);
		cdr = TestBed.inject(ChangeDetectorRef);

		fixture = TestBed.createComponent(DatePanelComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		beforeEach(() => {
			jest.spyOn(component, 'setIterationsParam');
			jest.spyOn(component, 'switchIteration');
			jest.spyOn(component, 'scrollHome');
			jest.spyOn(component, 'checkIteration');
			jest.spyOn(component, 'getIterationsListScrollable');
			jest.spyOn(component, 'switchCalendarPanel');
		});

		it('should initialize with default values', () => {
			component.ngOnInit();

			expect(component.isCalendarPanelOpen).toBeFalsy();
			expect(component.iterationsChecked).toEqual([]);
			expect(component.loading).toBeFalsy();
			expect(component.showIterationsInfo).toBeFalsy();
		});

		// it('should subscribe to action.eventUpdatedPoint$', () => {
		// 	actionService.pointUpdated(mockPoint);

		// 	component.ngOnInit();

		// 	expect(component.point).toEqual(mockPoint);
		// 	expect(component.setIterationsParam).toHaveBeenCalled();
		// });

		// it('should handle point updates', () => {
		// 	actionService.pointUpdated(mockPoint);

		// 	component.ngOnInit();

		// 	expect(component.point).toEqual(mockPoint);
		// 	expect(component.setIterationsParam).toHaveBeenCalled();
		// });

		// it('should handle iteration switching', () => {
		// 	actionService.pointUpdated(mockPoint);

		// 	component.ngOnInit();

		// 	expect(component.switchIteration).toHaveBeenCalled();
		// });

		// it('should handle scroll events', () => {
		// 	jest
		// 		.spyOn(document, 'addEventListener')
		// 		.mockImplementation((event: string, handler: EventListenerOrEventListenerObject) => {
		// 			if (event === 'wheel' && typeof handler === 'function') {
		// 				handler(new WheelEvent('wheel', { deltaY: 100 }));
		// 			}
		// 		});

		// 	component.ngOnInit();

		// 	expect(component.iterationsTabs.nativeElement.scrollLeft).toBe(100);
		// });

		// it('should handle edit point events', () => {
		// 	const newIteration: Iteration = {
		// 		date: '25.01.2025 11:40',
		// 		reason: 'byHand',
		// 	};
		// 	component.ngOnInit();

		// 	expect(component.switchIteration).toHaveBeenCalled();
		// 	expect(component.setIterationsParam).toHaveBeenCalled();
		// 	expect(component.checkIteration).toHaveBeenCalled();
		// 	expect(component.getIterationsListScrollable).toHaveBeenCalled();
		// });

		it('should toggle calendar panel', () => {
			component.ngOnInit();

			expect(component.switchCalendarPanel).toHaveBeenCalled();
		});

		it('should set showIterationsInfo from localStorage', () => {
			localStorage.setItem('showIterationsInfo', 'true');

			component.ngOnInit();

			expect(component.showIterationsInfo).toBeTruthy();
		});
	});
});
