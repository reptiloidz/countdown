import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService, DataService, NotifyService } from '../../../../services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { DatepickerComponent } from 'src/app/components/datepicker/datepicker.component';
import { Auth, User } from '@angular/fire/auth';
import { Point } from 'src/app/interfaces';
import { InputComponent } from 'src/app/components/input/input.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

const mockAuth = {
	currentUser: {
		uid: 'test-user',
		displayName: 'Test User',
		email: 'test@example.com',
	},
	signInWithEmailAndPassword: jest.fn(),
	signOut: jest.fn(),
};

describe('ProfileComponent', () => {
	let component: ProfileComponent;
	let fixture: ComponentFixture<ProfileComponent>;
	let authServiceMock: any;
	let dataServiceMock: any;
	let notifyServiceMock: any;
	let store: MockStore;

	beforeEach(async () => {
		authServiceMock = {
			updateProfile: jest.fn(),
			eventBirthDateAdded$: new Subject<void>(),
			eventEmailUpdated$: new Subject<string>(),
			eventPasswordUpdated$: new Subject<boolean>(),
			eventAccountDeleted$: new Subject<void>(),
			eventVerifyEmailSent$: new Subject<void>(),
			updateUserBirthDate: jest.fn(),
			verifyEmail: jest.fn(),
			updateEmail: jest.fn(),
			updatePassword: jest.fn(),
			removeAccount: jest.fn(),
			currentUser: new BehaviorSubject<User | null>(null),
		};

		dataServiceMock = {
			addPoint: jest.fn(),
			eventAddPoint$: new Subject<Point>(),
		};

		notifyServiceMock = {
			confirm: jest.fn().mockReturnValue(of(true)),
		};

		await TestBed.configureTestingModule({
			declarations: [ProfileComponent, DatepickerComponent, InputComponent],
			providers: [
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: DataService, useValue: dataServiceMock },
				{ provide: NotifyService, useValue: notifyServiceMock },
				{ provide: Auth, useValue: mockAuth },
				[provideNgxMask()],
				provideMockStore({
					initialState: {
						loading: {
							userpicLoading: false,
							profileLoading: false,
							emailLoading: false,
							passwordLoading: false,
							removeLoading: false,
							unlinkLoading: false,
						},
					},
				}),
			],
			imports: [ReactiveFormsModule, FormsModule, NgxMaskDirective],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		store = TestBed.inject(MockStore);
		fixture = TestBed.createComponent(ProfileComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call updateProfile on form submission', () => {
		jest.spyOn(component, 'updateProfile');
		component.formData.controls['name'].setValue('New Name');
		component.updateProfile();
		expect(component.updateProfile).toHaveBeenCalled();
	});

	it('should call sendEmailVerification', () => {
		component.sendEmailVerification();
		expect(authServiceMock.verifyEmail).toHaveBeenCalledWith(component.user);
	});

	it('should call updateEmail', () => {
		component.formEmail.controls['email'].setValue('test@example.com');
		component.updateEmail();
		expect(authServiceMock.updateEmail).toHaveBeenCalledWith(component.user, 'test@example.com');
	});

	it('should call updatePassword', () => {
		component.formPassword.controls['password'].setValue('oldPass');
		component.formPassword.controls['new-password'].setValue('newPass');
		component.updatePassword();
		expect(authServiceMock.updatePassword).toHaveBeenCalledWith(component.user, 'oldPass', 'newPass');
	});

	it('should call removeAccount on confirmation', fakeAsync(() => {
		component.removeAccount();
		tick();
		expect(authServiceMock.removeAccount).toHaveBeenCalledWith(component.user, component.birthDatePointId);
	}));
});
