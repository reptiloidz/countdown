import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegComponent } from './reg.component';
import { AuthService, NotifyService, PopupService } from 'src/app/services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { InputComponent } from 'src/app/components/input/input.component';
import { PrivacyComponent } from 'src/app/components/privacy/privacy.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { CheckboxComponent } from 'src/app/components/checkbox/checkbox.component';

jest.mock('src/app/services/auth.service');
jest.mock('src/app/services/notify.service');
jest.mock('src/app/services/popup.service');

describe('RegComponent', () => {
	let component: RegComponent;
	let fixture: ComponentFixture<RegComponent>;
	let authService: jest.Mocked<AuthService>;
	let notifyService: jest.Mocked<NotifyService>;
	let popupService: jest.Mocked<PopupService>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [RegComponent, InputComponent, ButtonComponent, CheckboxComponent],
			imports: [ReactiveFormsModule, FormsModule, NgxMaskDirective],
			providers: [
				{ provide: AuthService, useValue: { register: jest.fn(), login: jest.fn() } },
				{ provide: NotifyService, useValue: { add: jest.fn() } },
				{ provide: PopupService, useValue: { show: jest.fn() } },
				[provideNgxMask()],
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(RegComponent);
		component = fixture.componentInstance;
		authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
		notifyService = TestBed.inject(NotifyService) as jest.Mocked<NotifyService>;
		popupService = TestBed.inject(PopupService) as jest.Mocked<PopupService>;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize form on ngOnInit', () => {
		expect(component.form).toBeDefined();
		expect(component.form.controls['email']).toBeDefined();
		expect(component.passwordsForm.controls['password']).toBeDefined();
	});

	it('should show privacy popup', () => {
		component.showPrivacy();
		expect(popupService.show).toHaveBeenCalledWith(
			'Политика в отношении обработки персональных данных',
			PrivacyComponent,
		);
	});

	it('should not submit form if invalid', () => {
		component.submit();
		expect(authService.register).not.toHaveBeenCalled();
	});

	it('should register user when form is valid', () => {
		component.form.setValue({
			email: 'test@example.com',
			privacyAgree: true,
			passwords: { password: 'password123', passwordRepeat: 'password123' },
		});

		authService.register.mockReturnValue(of({ email: 'test@example.com' }));
		component.submit();
		expect(authService.register).toHaveBeenCalled();
	});

	it('should show error on registration failure', () => {
		component.form.setValue({
			email: 'test@example.com',
			privacyAgree: true,
			passwords: { password: 'password123', passwordRepeat: 'password123' },
		});

		authService.register.mockReturnValue(throwError(() => ({ error: { error: { message: 'EMAIL_EXISTS' } } })));
		component.submit();
		expect(notifyService.add).toHaveBeenCalledWith({
			title: 'Пользователь с&nbsp;таким e-mail уже существует',
			view: 'negative',
		});
	});
});
