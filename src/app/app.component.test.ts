import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ActionService, NotifyService } from './services';
import { ActivationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotifyComponent } from './components/notify/notify.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Constants } from './enums';

describe('AppComponent', () => {
	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;
	let actionService: ActionService;
	let notifyService: NotifyService;
	let router: Router;
	let mockRouter: jest.Mocked<Router>;

	beforeEach(async () => {
		mockRouter = {
			events: new Subject(),
		} as unknown as jest.Mocked<Router>;

		await TestBed.configureTestingModule({
			declarations: [AppComponent, NotifyComponent],
			providers: [
				{ provide: ActionService, useValue: { intervalSwitched: jest.fn() } },
				{ provide: NotifyService, useValue: { add: jest.fn() } },
				{ provide: Router, useValue: mockRouter },
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(AppComponent);
		component = fixture.componentInstance;
		actionService = TestBed.inject(ActionService);
		notifyService = TestBed.inject(NotifyService);
		router = TestBed.inject(Router);
	});

	it('should create the app', () => {
		expect(component).toBeTruthy();
	});

	it('should set isUrlMode based on router events', () => {
		const routerEvents = mockRouter.events as Subject<any>;
		component.ngOnInit();
		routerEvents.next(new ActivationStart({ url: [{ path: 'url' }] } as any));
		expect(component.isUrlMode).toBe(true);
	});

	it('should set --start-time on document element style on init', () => {
		const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');
		component.ngOnInit();
		expect(setPropertySpy).toHaveBeenCalledWith('--start-time', expect.any(String));
	});

	it('should update --count and call intervalSwitched on interval', done => {
		Object.defineProperty(Constants, 'tick', { value: 1 });
		jest.useFakeTimers();
		component.ngOnInit();
		jest.advanceTimersByTime(3000);
		expect(+document.documentElement.style.getPropertyValue('--count')).toBeLessThanOrEqual(2);
		expect(actionService.intervalSwitched).toHaveBeenCalled();
		jest.useRealTimers();
		done();
	});

	it('should unsubscribe from subscriptions on destroy', () => {
		const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
		component.ngOnDestroy();
		expect(unsubscribeSpy).toHaveBeenCalled();
	});

	it('should return environment.production for isProd', () => {
		expect(component.isProd).toBe(environment.production);
	});

	it('should update count on visibility change', () => {
		component.startTime = new Date(Date.now() - 5000);
		Object.defineProperty(document, 'hidden', { value: false, writable: true });
		component.changeVisibilityHandler();
		expect(component.count).toBe(5);
	});

	it('should call notify.add with correct parameters on toast', () => {
		component.toast();
		expect(notifyService.add).toHaveBeenCalledWith({
			title: `Создано событие "<a href="../point/" class="notify-list__link">С днем рождения</a>"`,
			view: 'positive',
		});
	});
});
