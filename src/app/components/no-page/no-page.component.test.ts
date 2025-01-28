import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoPageComponent } from './no-page.component';
import { ActionService } from 'src/app/services';
import { of, throwError } from 'rxjs';

describe('NoPageComponent', () => {
	let component: NoPageComponent;
	let fixture: ComponentFixture<NoPageComponent>;
	let actionService: ActionService;

	beforeEach(async () => {
		const actionServiceMock = {
			_eventShortLinkChecked$: of({}),
		};

		await TestBed.configureTestingModule({
			declarations: [NoPageComponent],
			providers: [{ provide: ActionService, useValue: actionServiceMock }],
		}).compileComponents();

		fixture = TestBed.createComponent(NoPageComponent);
		component = fixture.componentInstance;
		actionService = TestBed.inject(ActionService);
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with default values', () => {
		expect(component.loading).toBe(true);
	});

	it('should set loading to false on successful subscription', () => {
		component.ngOnInit();
		expect(component.loading).toBe(false);
	});

	it('should set loading to false on subscription error', () => {
		actionService._eventShortLinkChecked$ = throwError(() => new Error('error'));
		component.ngOnInit();
		expect(component.loading).toBe(false);
	});

	it('should unsubscribe on destroy', () => {
		const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
		component.ngOnDestroy();
		expect(unsubscribeSpy).toHaveBeenCalled();
	});
});
