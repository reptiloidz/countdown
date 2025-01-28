import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainListComponent } from './main-list.component';
import { DataService, ActionService, AuthService, PopupService } from 'src/app/services';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ElementRef } from '@angular/core';
import { InputComponent } from '../input/input.component';
import { DatePointsPopupComponent } from '../date-points-popup/date-points-popup.component';
import { Point } from 'src/app/interfaces';

describe('MainListComponent', () => {
	let component: MainListComponent;
	let fixture: ComponentFixture<MainListComponent>;
	let dataService: DataService;
	let actionService: ActionService;
	let popupService: PopupService;
	let router: Router;
	let route: ActivatedRoute;

	beforeEach(async () => {
		const dataServiceMock = {
			eventFetchAllPoints$: of([]),
			eventRemovePoint$: of(''),
			fetchAllPoints: jest.fn(),
			removePoints: jest.fn(),
		};

		const actionServiceMock = {
			pointsFetched: jest.fn(),
			uncheckAllPoints: jest.fn(),
			hasEditablePoints: jest.fn(),
			getCheckedPoints: jest.fn(),
		};

		const authServiceMock = {
			isAuthenticated: true,
			checkAccessEdit: jest.fn().mockReturnValue(true),
		};

		const popupServiceMock = {
			show: jest.fn(),
		};

		const routerMock = {
			navigate: jest.fn(),
			events: of({}),
		};

		const routeMock = {
			queryParams: of({}),
		};

		await TestBed.configureTestingModule({
			declarations: [MainListComponent, InputComponent, DatePointsPopupComponent],
			providers: [
				{ provide: DataService, useValue: dataServiceMock },
				{ provide: ActionService, useValue: actionServiceMock },
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: PopupService, useValue: popupServiceMock },
				{ provide: Router, useValue: routerMock },
				{ provide: ActivatedRoute, useValue: routeMock },
				{ provide: ElementRef, useValue: {} },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(MainListComponent);
		component = fixture.componentInstance;
		dataService = TestBed.inject(DataService);
		actionService = TestBed.inject(ActionService);
		popupService = TestBed.inject(PopupService);
		router = TestBed.inject(Router);
		route = TestBed.inject(ActivatedRoute);
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with default values', () => {
		expect(component.points).toEqual([]);
		expect(component.loading).toBe(true);
		expect(component.isDatePointsChecked).toBe(false);
		expect(component.datePointsChecked).toEqual([]);
		expect(component.isAllDatesChecked).toBe(false);
		expect(component.sortType).toBe('titleAsc');
		expect(component.colorType).toEqual([]);
		expect(component.repeatableValue).toBe('all');
		expect(component.greenwichValue).toBe('all');
		expect(component.publicValue).toBe('all');
		expect(component.directionValue).toBe('all');
		expect(component.modesValue).toBe('grid');
		expect(component.searchInputValue).toBe('');
		expect(component.isFiltersVisible).toBe(false);
	});

	it('should fetch all points on init', () => {
		expect(dataService.fetchAllPoints).toHaveBeenCalled();
	});

	it('should handle points fetched event', () => {
		const points: Point[] = [
			{
				id: '1',
				title: 'Test Point',
				color: 'red',
				dates: [
					{
						date: '29.01.2025 12:00',
						reason: 'byHand',
					},
				],
				repeatable: true,
				greenwich: false,
				public: true,
				direction: 'forward',
			},
		];
		dataService.eventFetchAllPoints$ = of(points);
		component.ngOnInit();
		expect(component.points).toEqual(points);
		expect(actionService.pointsFetched).toHaveBeenCalled();
	});

	it('should handle point removal event', () => {
		const points: Point[] = [
			{
				id: '1',
				title: 'Test Point',
				color: 'red',
				dates: [
					{
						date: '29.01.2025 12:00',
						reason: 'byHand',
					},
				],
				repeatable: true,
				greenwich: false,
				public: true,
				direction: 'forward',
			},
			{
				id: '2',
				title: 'Test Point 2',
				color: 'blue',
				dates: [
					{
						date: '30.01.2025 15:00',
						reason: 'byHand',
					},
				],
				repeatable: false,
				greenwich: true,
				public: true,
				direction: 'backward',
			},
		];
		component.points = points;
		dataService.eventRemovePoint$ = of('1');
		component.ngOnInit();
		expect(component.points).toEqual([]);
	});

	it('should handle query params', () => {
		const queryParams = {
			search: 'test',
			sort: 'dateAsc',
			repeat: 'true',
			greenwich: 'false',
			public: 'true',
			direction: 'forward',
			color: 'red+blue',
		};
		route.queryParams = of(queryParams);
		component.ngOnInit();
		expect(component.searchInputValue).toBe('test');
		expect(component.sortType).toBe('dateAsc');
		expect(component.repeatableValue).toBe('true');
		expect(component.greenwichValue).toBe('false');
		expect(component.publicValue).toBe('true');
		expect(component.directionValue).toBe('forward');
		expect(component.colorType).toEqual(['red', 'blue']);
	});

	it('should change filters and navigate', () => {
		component.changeFilters();
		expect(router.navigate).toHaveBeenCalled();
	});

	it('should clear filters', () => {
		component.searchInput = { value: '111' } as any;
		component.clearFilters();
		expect(component.repeatableValue).toBe('all');
		expect(component.greenwichValue).toBe('all');
		expect(component.publicValue).toBe('all');
		expect(component.directionValue).toBe('all');
		expect(component.searchInput.value).toBe('');
		expect(component.colorType).toEqual([]);
	});

	it('should change modes and save to localStorage', () => {
		component.changeModes('list');
		expect(component.modesValue).toBe('list');
		expect(localStorage.getItem('modesValue')).toBe('list');
	});

	it('should open date point popup', () => {
		const date = { date: new Date(), points: [] };
		component.openDatePointPopup(date);
		expect(popupService.show).toHaveBeenCalled();
	});
});
