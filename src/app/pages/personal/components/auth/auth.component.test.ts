import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { AuthService, NotifyService } from 'src/app/services';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { InputComponent } from 'src/app/components/input/input.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

describe('AuthComponent', () => {
	let component: AuthComponent;
	let fixture: ComponentFixture<AuthComponent>;
	let authServiceMock: any;
	let notifyServiceMock: any;
	let routerMock: any;

	beforeEach(async () => {
		authServiceMock = {
			login: jest.fn().mockResolvedValue(true),
			resetPassword: jest.fn(),
			eventResetPassword$: of(null),
		};

		notifyServiceMock = {
			add: jest.fn(),
			prompt: jest.fn().mockReturnValue(of('test@example.com')),
		};

		routerMock = {
			navigate: jest.fn(),
		};

		await TestBed.configureTestingModule({
			declarations: [AuthComponent, InputComponent, ButtonComponent],
			imports: [ReactiveFormsModule, FormsModule, NgxMaskDirective],
			providers: [
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: NotifyService, useValue: notifyServiceMock },
				{ provide: Router, useValue: routerMock },
				[provideNgxMask()],
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(AuthComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize form with empty values', () => {
		expect(component.form.value).toEqual({ email: null, password: null });
	});

	it('should show error messages for invalid email', async () => {
		component.form.controls['email'].setValue('invalid-email');
		component.form.controls['email'].markAsDirty();
		fixture.detectChanges();
		expect(component.form.controls['email'].errors).toBeTruthy();
	});

	it('should show error messages for short password', () => {
		component.form.controls['password'].setValue('123');
		component.form.controls['password'].markAsDirty();
		fixture.detectChanges();
		expect(component.form.controls['password'].errors).toBeTruthy();
	});

	it('should call AuthService login on valid form submit', async () => {
		component.form.setValue({ email: 'test@example.com', password: 'password123' });
		await component.submit();
		expect(authServiceMock.login).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'password123',
		});
	});

	it('should navigate on successful login', async () => {
		component.form.setValue({ email: 'test@example.com', password: 'password123' });
		await component.submit();
		expect(routerMock.navigate).toHaveBeenCalledWith(['']);
	});

	it('should show error notification on login failure', async () => {
		authServiceMock.login.mockRejectedValue({ code: 'auth/user-not-found' });
		component.form.setValue({ email: 'test@example.com', password: 'password123' });
		await component.submit();
		expect(notifyServiceMock.add).toHaveBeenCalledWith({
			title: 'Пользователя с&nbsp;таким e-mail не&nbsp;существует',
			view: 'negative',
		});
	});

	it('should call resetPassword on password reset request', () => {
		component.resetPassword();
		expect(authServiceMock.resetPassword).toHaveBeenCalledWith('test@example.com');
	});
});
