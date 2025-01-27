import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePanelComponent } from './date-panel.component';
import { DataService, ActionService, AuthService, NotifyService } from 'src/app/services';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { PanelComponent } from '../panel/panel.component';
import { Point } from 'src/app/interfaces';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { CheckCopiesPipe } from 'src/app/pipes/check-copies.pipe';

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

const disableAnimations =
	!('animate' in document.documentElement) || (navigator && /iPhone OS (8|9|10|11|12|13)_/.test(navigator.userAgent));

const mockAnimations = () => {
	Element.prototype.animate = jest.fn().mockImplementation(() => ({
		finished: Promise.resolve(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		play: jest.fn(),
		cancel: jest.fn(),
	}));
};

describe('DatePanelComponent', () => {
	let component: DatePanelComponent;
	let fixture: ComponentFixture<DatePanelComponent>;

	let mockDataService: Partial<DataService>;
	let mockActionService: Partial<ActionService>;
	let mockAuthService: Partial<AuthService>;
	let mockNotifyService: Partial<NotifyService>;
	let mockRouter: Partial<Router>;
	let mockActivatedRoute: Partial<ActivatedRoute>;

	beforeAll(() => {
		mockAnimations();
		(window as any).ResizeObserver = jest.fn(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		}));
		(window as any).getComputedStyle = jest.fn().mockReturnValue({ paddingLeft: '10px', paddingRight: '10px' });
	});

	beforeEach(async () => {
		mockDataService = {
			putPoint: jest.fn(),
			editPoint: jest.fn(),
			removePoints: jest.fn(),
			eventAddPoint$: new Subject(),
			eventEditPoint$: new Subject(),
			eventRemovePoint$: new Subject(),
			fetchPoint: jest.fn(() => of(mockPoint)),
			setDateNow: jest.fn(),
		} as unknown as jest.Mocked<DataService>;

		mockAuthService = {
			isAuthenticated: true,
			checkEmailVerified: true,
			checkAccessEdit: jest.fn().mockReturnValue(true),
			getUserData: jest.fn(),
			eventEditAccessCheck$: new BehaviorSubject({ pointId: null, access: true }),
		} as unknown as jest.Mocked<AuthService>;

		mockActionService = {
			eventPointsChecked$: new Subject(),
			eventHasEditablePoints$: new Subject(),
			eventUpdatedPoint$: new BehaviorSubject(mockPoint),
			hasEditablePoints: jest.fn(),
			checkAllPoints: jest.fn(),
			uncheckAllPoints: jest.fn(),
			pointUpdated: jest.fn().mockReturnValue(mockPoint),
		} as unknown as jest.Mocked<ActionService>;

		mockNotifyService = {
			confirm: jest.fn().mockReturnValue(of(true)),
		};

		mockRouter = {
			navigate: jest.fn(),
		};

		mockActivatedRoute = {
			queryParams: of({}),
		};

		await TestBed.configureTestingModule({
			imports: [BrowserAnimationsModule.withConfig({ disableAnimations })],
			declarations: [DatePanelComponent, PanelComponent, CheckCopiesPipe],
			providers: [
				{ provide: DataService, useValue: mockDataService },
				{ provide: ActionService, useValue: mockActionService },
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: NotifyService, useValue: mockNotifyService },
				{ provide: Router, useValue: mockRouter },
				{ provide: ActivatedRoute, useValue: mockActivatedRoute },
				provideAnimations(),
			],
			schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(DatePanelComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		fixture.detectChanges();
		expect(component).toBeTruthy();
	});

	it('should initialize with default values', () => {
		expect(component.isCalendarPanelOpen).toBe(false);
		expect(component.isCalendarCreated).toBe(false);
		expect(component.hasAccess).toBe(false);
		expect(component.iterationsChecked).toEqual([]);
	});

	it('should call switchIteration on iteration change', () => {
		jest.spyOn(component, 'switchIteration');
		component.switchIteration(1);
		expect(component.switchIteration).toHaveBeenCalledWith(1);
		expect(mockRouter.navigate).toHaveBeenCalledWith([], {
			relativeTo: mockActivatedRoute,
			queryParams: { iteration: 2 },
			queryParamsHandling: 'merge',
		});
	});

	it('should update access when a point is provided', () => {
		component.point = { id: 1, dates: [], repeatable: true } as any;
		component.ngOnInit();
		expect(mockAuthService.checkAccessEdit).toHaveBeenCalledWith(component.point);
		expect(component.hasAccess).toBe(true);
	});

	it('should handle iterations removal', () => {
		component.point = { id: 1, dates: [{ date: '2023-01-01' }, { date: '2023-01-02' }] } as any;
		jest.spyOn(mockNotifyService, 'confirm').mockReturnValue(of(true));
		jest.spyOn(mockDataService, 'editPoint').mockImplementation(() => {});

		component.removeIteration(0);

		expect(mockNotifyService.confirm).toHaveBeenCalled();
		expect(mockDataService.editPoint).toHaveBeenCalledWith(1, {
			id: 1,
			dates: [{ date: '2023-01-02' }],
		});
	});

	it('should toggle calendar panel', () => {
		component.switchCalendarPanel(true);
		expect(component.isCalendarPanelOpen).toBe(true);

		component.switchCalendarPanel(false);
		expect(component.isCalendarPanelOpen).toBe(false);
	});

	it('should emit addIteration event on addIterationClick', () => {
		jest.spyOn(component.addIteration, 'emit');
		component.addIterationClick();
		expect(component.addIteration.emit).toHaveBeenCalled();
		expect(mockRouter.navigate).toHaveBeenCalledWith([], {
			relativeTo: mockActivatedRoute,
			queryParams: { iteration: null },
			queryParamsHandling: 'merge',
		});
	});

	it('should calculate scrollable iterations list', () => {
		const mockElement = {
			nativeElement: {
				clientWidth: 500,
			},
		} as any;
		component.iterationsList = mockElement;
		component.iterationsTabs = {
			nativeElement: {
				clientWidth: 400,
				style: { paddingLeft: '10px', paddingRight: '10px' },
			},
		} as any;

		component.getIterationsListScrollable();
		expect(component.iterationsListScrollable).toBe(true);
	});

	it('should scroll iterations list to home', () => {
		const mockTabs = {
			nativeElement: {
				querySelector: jest.fn().mockReturnValue({
					scrollIntoView: jest.fn(),
				}),
			},
		} as any;
		component.iterationsTabs = mockTabs;

		component.scrollHome();
		expect(mockTabs.nativeElement.querySelector).toHaveBeenCalledWith('.tabs__item--active input');
	});
});
