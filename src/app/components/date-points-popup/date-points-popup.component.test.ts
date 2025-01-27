import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { Router, ActivationStart } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { AuthService, DataService, PopupService } from 'src/app/services';
import { DatePointsPopupComponent } from './date-points-popup.component';
import { Point } from 'src/app/interfaces';
import { CheckEditablePointsPipe } from 'src/app/pipes/check-editable-points.pipe';

describe('DatePointsPopupComponent', () => {
	let component: DatePointsPopupComponent;
	let fixture: ComponentFixture<DatePointsPopupComponent>;
	let mockDataService: jest.Mocked<DataService>;
	let mockAuthService: Partial<AuthService>;
	let mockPopupService: jest.Mocked<PopupService>;
	let mockRouter: jest.Mocked<Router>;

	beforeEach(() => {
		mockDataService = {
			eventRemovePoint$: new Subject(),
			eventFetchAllPoints$: new BehaviorSubject([]),
			removePoints: jest.fn(),
			fetchAllPoints: jest.fn(),
		} as unknown as jest.Mocked<DataService>;

		mockAuthService = {
			isAuthenticated: true,
			checkEmailVerified: true,
			checkAccessEdit: jest.fn().mockReturnValue(true),
			getUserData: jest.fn(),
			eventEditAccessCheck$: new BehaviorSubject({ pointId: null, access: true }),
		} as unknown as jest.Mocked<AuthService>;

		mockPopupService = {
			close: jest.fn(),
		} as unknown as jest.Mocked<PopupService>;

		mockRouter = {
			events: new Subject(),
		} as unknown as jest.Mocked<Router>;

		TestBed.configureTestingModule({
			declarations: [DatePointsPopupComponent, CheckEditablePointsPipe],
			providers: [
				{ provide: DataService, useValue: mockDataService },
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: PopupService, useValue: mockPopupService },
				{ provide: Router, useValue: mockRouter },
				ChangeDetectorRef,
				ViewContainerRef,
			],
		});

		fixture = TestBed.createComponent(DatePointsPopupComponent);
		component = new DatePointsPopupComponent(
			mockDataService,
			mockPopupService,
			TestBed.inject(ChangeDetectorRef),
			mockRouter,
		);
	});

	afterEach(() => {
		component.ngOnDestroy();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it.skip('should filter points list and close popup if empty on point removal event', () => {
		const initialPoints: Point[] = [
			{ id: '1', title: 'Point 1', dates: [], repeatable: false, greenwich: false, color: 'red', direction: 'forward' },
			{ id: '2', title: 'Point 2', dates: [], repeatable: false, greenwich: false, color: 'red', direction: 'forward' },
		];
		const updatedPoints: Point[] = [
			{ id: '1', title: 'Point 1', dates: [], repeatable: false, greenwich: false, color: 'red', direction: 'forward' },
		];

		component.pointsList = initialPoints;

		const cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
		jest.spyOn(cdr, 'detectChanges');

		jest.spyOn(mockDataService, 'removePoints').mockImplementation(() => {
			(mockDataService.eventFetchAllPoints$ as Subject<Point[]>).next(updatedPoints);
		});
		mockDataService.removePoints({
			list: ['1', '2'],
		});
		// fixture.detectChanges();
		// cdr.detectChanges();

		// jest.spyOn(mockDataService, 'fetchAllPoints').mockImplementation(() => {
		// 	(mockDataService.eventFetchAllPoints$ as Subject<Point[]>).next(updatedPoints);
		// });
		// mockDataService.fetchAllPoints();

		cdr.detectChanges();
		fixture.detectChanges();
		console.log('pointsList', component.pointsList);

		expect(component.pointsList.length).toBe(1);
		expect(component.pointsList[0].id).toBe(1);
		expect(cdr.detectChanges).toHaveBeenCalled();
		expect(mockPopupService.close).not.toHaveBeenCalled();

		// Simulate empty points list
		mockDataService.eventFetchAllPoints$ = of([]);
		(mockDataService.eventRemovePoint$ as Subject<any>).next(null);

		expect(mockPopupService.close).toHaveBeenCalled();
	});

	it('should close popup on router ActivationStart event', () => {
		const routerEvents = mockRouter.events as Subject<any>;

		component.ngOnInit();

		// Emit router activation event
		routerEvents.next(new ActivationStart(null!));

		expect(mockPopupService.close).toHaveBeenCalled();
	});

	it('should unsubscribe from subscriptions on destroy', () => {
		const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
		component.ngOnDestroy();
		expect(unsubscribeSpy).toHaveBeenCalled();
	});
});
