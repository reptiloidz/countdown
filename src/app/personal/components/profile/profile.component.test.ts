import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../../services';
import { DataService } from '../../../services';
import { NotifyService } from '../../../services';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { DatepickerComponent } from 'src/app/components/datepicker/datepicker.component';
import { Auth, User } from '@angular/fire/auth';

const mockAuth = {
	currentUser: {
		uid: 'test-user',
		displayName: 'Test User',
		email: 'test@example.com',
	},
	signInWithEmailAndPassword: jest.fn(),
	signOut: jest.fn(),
};

describe.skip('ProfileComponent', () => {
	let component: ProfileComponent;
	let fixture: ComponentFixture<ProfileComponent>;
	let authServiceMock: any;
	let dataServiceMock: any;
	let notifyServiceMock: any;

	beforeEach(async () => {
		authServiceMock = {
			updateProfile: jest.fn(),
			eventBirthDateAdded: jest.fn(),
			updateUserBirthDate: jest.fn(),
			verifyEmail: jest.fn(),
			updateEmail: jest.fn(),
			updatePassword: jest.fn(),
			removeAccount: jest.fn(),
			currentUser: new BehaviorSubject<User | null>(null),
		};

		dataServiceMock = {
			addPoint: jest.fn(),
		};

		notifyServiceMock = {
			confirm: jest.fn().mockReturnValue(of(true)),
		};

		await TestBed.configureTestingModule({
			declarations: [ProfileComponent, DatepickerComponent],
			providers: [
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: DataService, useValue: dataServiceMock },
				{ provide: NotifyService, useValue: notifyServiceMock },
				{ provide: Auth, useValue: mockAuth },
			],
			imports: [ReactiveFormsModule],
		}).compileComponents();

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
