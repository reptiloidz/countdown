import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PointComponent } from './point.component';
import { DataService, AuthService, ActionService, NotifyService } from 'src/app/services';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { of } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { DatePanelComponent } from '../date-panel/date-panel.component';
import { PanelComponent } from '../panel/panel.component';
import { TimersComponent } from '../timers/timers.component';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Point } from 'src/app/interfaces';

const mockUrl: UrlSegment[] = [
	{
		path: 'some-path',
		parameters: {},
		parameterMap: {
			has: (name: string) => false,
			get: (name: string) => null,
			getAll: (name: string) => [],
			keys: [] as string[],
		},
	},
];

const mockAnimations = () => {
	Element.prototype.animate = jest.fn().mockImplementation(() => ({
		finished: Promise.resolve(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		play: jest.fn(),
		cancel: jest.fn(),
	}));
};

describe('PointComponent', () => {
	let component: PointComponent;
	let fixture: ComponentFixture<PointComponent>;
	let mockDataService: Partial<DataService>;
	let mockAuthService: Partial<AuthService>;
	let mockActionService: Partial<ActionService>;
	let mockNotifyService: Partial<NotifyService>;
	let mockRoute: Partial<ActivatedRoute>;
	let mockTitleService: Partial<Title>;

	beforeAll(() => {
		mockAnimations();
		(window as any).ResizeObserver = jest.fn(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		}));
	});

	beforeEach(async () => {
		mockDataService = {
			fetchPoint: jest.fn().mockReturnValue(of(undefined)),
			eventEditPoint$: of(),
		};
		mockAuthService = { isAuthenticated: true, getUserData: jest.fn().mockReturnValue(of(undefined)) };
		mockActionService = {
			eventIntervalSwitched$: of(),
			pointUpdated: jest.fn(),
			eventUpdatedPoint$: of(),
		};
		mockNotifyService = { add: jest.fn() };
		mockRoute = { url: of(mockUrl), queryParams: of({}), params: of({ id: '123' }) };
		mockTitleService = { setTitle: jest.fn() };

		await TestBed.configureTestingModule({
			imports: [BrowserAnimationsModule.withConfig({ disableAnimations: true })],
			declarations: [PointComponent, DatePanelComponent, PanelComponent, TimersComponent],
			providers: [
				{ provide: DataService, useValue: mockDataService },
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: ActionService, useValue: mockActionService },
				{ provide: NotifyService, useValue: mockNotifyService },
				{ provide: ActivatedRoute, useValue: mockRoute },
				{ provide: Title, useValue: mockTitleService },
				provideAnimations(),
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(PointComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should set urlMode based on route url', () => {
		component.ngOnInit();
		expect(component.urlMode.getValue()).toBe(false);
	});

	it('should fetch point data on init', () => {
		expect(mockDataService.fetchPoint).toHaveBeenCalledWith('123');
	});

	it('should update title based on timer', () => {
		component.setTimer();
		expect(mockTitleService.setTitle).toHaveBeenCalled();
	});

	it('should handle iteration switching', () => {
		component.iterationSwitchHandler(1);
		expect(component.currentIterationIndex).toBe(1);
	});

	it('should pause and resume timer', () => {
		component.point = {
			id: '1',
			dates: [
				{
					date: '15.01.2025 12:25:00',
					reason: 'byHand',
				},
				{
					date: '20.01.2025 16:40:00',
					reason: 'frequency',
				},
			],
			repeatable: true,
			greenwich: false,
			color: 'red',
			direction: 'backward',
			title: 'title',
		} as Point;
		component.pause();
		expect(component.pausedTime).toBeDefined();
		component.pause();
		expect(component.pausedTime).toBeUndefined();
	});
});
