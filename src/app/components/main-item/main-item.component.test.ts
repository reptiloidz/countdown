import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainItemComponent } from './main-item.component';
import { DataService, AuthService, ActionService, NotifyService } from 'src/app/services';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { of, Subject } from 'rxjs';
import { CheckAccessEditPipe } from 'src/app/pipes/check-access-edit.pipe';
import { LetDirective } from 'src/app/directives/let.directive';
import { TimersComponent } from '../timers/timers.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';

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
// Mock services
const mockDataService = {
	eventStartRemovePoint$: new Subject(),
	eventRemovePoint$: new Subject(),
	removePoints: jest.fn(),
	setDateNow: jest.fn(),
};

const mockAuthService = {
	isAuthenticated: true,
	getUserData: jest.fn(() => of({ displayName: 'User Name', photoURL: 'url' })),
	checkAccessEdit: jest.fn().mockReturnValue(true),
};

const mockActionService = {
	eventPointsCheckedAll$: new Subject(),
	eventIntervalSwitched$: new Subject(),
};

const mockNotifyService = {
	confirm: jest.fn(() => of(true)),
};

describe('MainItemComponent', () => {
	let component: MainItemComponent;
	let fixture: ComponentFixture<MainItemComponent>;

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
		await TestBed.configureTestingModule({
			imports: [BrowserAnimationsModule.withConfig({ disableAnimations })],
			declarations: [MainItemComponent, CheckboxComponent, CheckAccessEditPipe, LetDirective, TimersComponent],
			providers: [
				{ provide: DataService, useValue: mockDataService },
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: ActionService, useValue: mockActionService },
				{ provide: NotifyService, useValue: mockNotifyService },
				provideAnimations(),
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(MainItemComponent);
		component = fixture.componentInstance;
		component.point = {
			id: '1',
			dates: [
				{
					date: '28.01.2025 12:00',
					reason: 'byHand',
				},
			],
			title: 'Test Point',
			description: 'Test Description',
			color: 'red',
			direction: 'forward',
			greenwich: true,
			repeatable: false,
			public: true,
			user: 'userId',
		};
		fixture.detectChanges();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should subscribe to eventStartRemovePoint$', () => {
		mockDataService.eventStartRemovePoint$.next('1');
		expect(component.loading).toBeTruthy();
	});

	it('should unsubscribe on destroy', () => {
		const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
		component.ngOnDestroy();
		expect(unsubscribeSpy).toHaveBeenCalled();
	});

	it('should call removePoints on delete', () => {
		component.delete('1');
		expect(mockDataService.removePoints).toHaveBeenCalledWith({ id: '1' });
	});

	it('should emit pointCheck on checkPoint', () => {
		jest.spyOn(component.pointCheck, 'emit');
		component.checkPoint();
		expect(component.pointCheck.emit).toHaveBeenCalled();
	});

	it('should call getUserData on loadUserInfo', () => {
		component.loadUserInfo('userId');
		expect(mockAuthService.getUserData).toHaveBeenCalledWith('userId');
	});

	it('should call setDateNow on setDateNow', () => {
		component.setDateNow();
		expect(mockNotifyService.confirm).toHaveBeenCalled();
		expect(mockDataService.setDateNow).toHaveBeenCalledWith(component.point);
	});

	it('should correctly calculate isDirectionCorrect', () => {
		jest.spyOn(component, 'closestIteration', 'get').mockReturnValue(new Date(Date.now() + 1000));
		expect(component.isDirectionCorrect).toBe(false);
	});

	it('should update timer values when setTimer is called', () => {
		jest.spyOn(component, 'interval', 'get').mockReturnValue({
			hours: 2,
			minutes: 30,
			seconds: 45,
			years: 0,
			months: 0,
			days: 0,
		});
		component.setTimer();
		expect(component.timerHours).toBe('02');
		expect(component.timerMins).toBe('30');
		expect(component.timerSecs).toBe('45');
	});

	it('should handle action events for checking all points', () => {
		const checkboxComponent = { isDisabled: false, isChecked: false };
		component['pointCheckbox'] = checkboxComponent as CheckboxComponent;

		mockActionService.eventPointsCheckedAll$.next(true);
		expect(component['pointCheckbox'].isChecked).toBeTruthy();
	});
});
