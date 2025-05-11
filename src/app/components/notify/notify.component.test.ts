import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotifyComponent } from './notify.component';
import { NotifyService } from 'src/app/services';
import { Notification } from 'src/app/interfaces';
import { BehaviorSubject } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../input/input.component';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

const mockAnimations = () => {
	Element.prototype.animate = jest.fn().mockImplementation(() => ({
		finished: Promise.resolve(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		play: jest.fn(),
		pause: jest.fn(),
		cancel: jest.fn(),
	}));
};

describe('NotifyComponent', () => {
	let component: NotifyComponent;
	let fixture: ComponentFixture<NotifyComponent>;
	let notifyService: NotifyService;

	beforeAll(() => {
		mockAnimations();
	});

	beforeEach(async () => {
		const notifyServiceMock = {
			notifications$: new BehaviorSubject<Notification[]>([]),
			closeModals: jest.fn(),
			close: jest.fn(),
			submit: jest.fn(),
		};

		await TestBed.configureTestingModule({
			declarations: [NotifyComponent, InputComponent],
			imports: [
				BrowserAnimationsModule.withConfig({ disableAnimations: true }),
				ReactiveFormsModule,
				FormsModule,
				NgxMaskDirective,
			],
			providers: [{ provide: NotifyService, useValue: notifyServiceMock }, provideAnimations(), [provideNgxMask()]],
			schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(NotifyComponent);
		component = fixture.componentInstance;
		notifyService = TestBed.inject(NotifyService);
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with default values', () => {
		expect(component.notifyList).toEqual([]);
		expect(component.errorMessages).toEqual([]);
		expect(component.isControlEmpty).toBe(true);
		expect(component.controlsValidated).toEqual({
			email: {
				required: { value: false },
				correct: { value: false },
				dirty: false,
			},
			password: {
				required: { value: false },
				enough: { value: false },
				dirty: false,
			},
		});
	});

	it('should subscribe to notifications on init', () => {
		const notifications: Notification[] = [
			{
				date: new Date(),
				title: 'Test notification',
				type: 'email',
				prompt: true,
			},
		];
		(notifyService.notifications$ as BehaviorSubject<Notification[]>).next(notifications);
		component.ngOnInit();
		expect(component.notifyList).toEqual(notifications);
		expect(component.promptType).toBe('email');
		expect(component.isControlEmpty).toBe(true);
	});

	it('should handle form value changes', () => {
		component.ngOnInit();
		component.form.controls['email'].setValue('test@example.com');
		component.form.controls['password'].setValue('password123');
		expect(component.isControlEmpty).toBe(false);
	});

	it('should close notify on escape keydown', () => {
		const event = new KeyboardEvent('keydown', { key: 'Escape' });
		document.dispatchEvent(event);
		expect(notifyService.closeModals).toHaveBeenCalled();
	});

	it('should unsubscribe on destroy', () => {
		const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
		component.ngOnDestroy();
		expect(unsubscribeSpy).toHaveBeenCalled();
	});

	it('should close notify', () => {
		const date = new Date();
		component.closeNotify(date);
		expect(notifyService.close).toHaveBeenCalledWith(date);
	});

	it('should submit notify', () => {
		const date = new Date();
		component.submitNotify(date);
		expect(notifyService.submit).toHaveBeenCalledWith(date);
	});

	it('should validate email field', () => {
		component.ngOnInit();
		component.form.controls['email'].setValue('invalid-email');
		fixture.detectChanges();
		expect(component.form.controls['email'].errors).toBeTruthy();
	});

	it('should validate password field', () => {
		component.ngOnInit();
		component.form.controls['password'].setValue('short');
		fixture.detectChanges();
		expect(component.form.controls['password'].errors).toBeTruthy();
	});

	it('should check if form is invalid', async () => {
		const notifications: Notification[] = [
			{
				date: new Date(),
				title: 'Test notification',
				type: 'email',
				prompt: true,
			},
		];
		(notifyService.notifications$ as BehaviorSubject<Notification[]>).next(notifications);

		component.ngOnInit(); // Инициализация формы и подписок
		component.form.controls['email'].setValue('invalid-email');
		component.controlsValidated['email'].dirty = true;

		expect(component.isInvalid).toBeTruthy();
	});
});
