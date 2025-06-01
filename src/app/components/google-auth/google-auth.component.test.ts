import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoogleAuthComponent } from './google-auth.component';
import { AuthService, NotifyService, PopupService } from 'src/app/services';
import { PrivacyComponent } from '../privacy/privacy.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';

describe('GoogleAuthComponent', () => {
	let component: GoogleAuthComponent;
	let fixture: ComponentFixture<GoogleAuthComponent>;
	let authServiceMock: jest.Mocked<AuthService>;
	let notifyServiceMock: jest.Mocked<NotifyService>;
	let popupServiceMock: jest.Mocked<PopupService>;

	beforeEach(async () => {
		// Create mock services
		authServiceMock = {
			login: jest.fn(),
		} as any;

		notifyServiceMock = {
			add: jest.fn(),
		} as any;

		popupServiceMock = {
			show: jest.fn(),
		} as any;

		await TestBed.configureTestingModule({
			declarations: [GoogleAuthComponent, CheckboxComponent],
			providers: [
				{ provide: AuthService, useValue: authServiceMock },
				{ provide: NotifyService, useValue: notifyServiceMock },
				{ provide: PopupService, useValue: popupServiceMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(GoogleAuthComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with acceptedPrivacy as false', () => {
		expect(component.acceptedPrivacy).toBeFalsy();
	});

	describe('authGoogle', () => {
		it('should call auth.login with google: true', async () => {
			authServiceMock.login.mockResolvedValueOnce(undefined);

			await component.authGoogle();

			expect(authServiceMock.login).toHaveBeenCalledWith({ google: true });
		});

		it('should handle login error and show notification', async () => {
			const error = new Error('Test error');
			authServiceMock.login.mockRejectedValueOnce(error);

			await component.authGoogle();

			expect(notifyServiceMock.add).toHaveBeenCalledWith({
				title: 'Ошибка при авторизации через Google',
				view: 'negative',
			});
		});
	});

	describe('showPrivacy', () => {
		it('should call popupService.show with correct parameters', () => {
			component.showPrivacy();

			expect(popupServiceMock.show).toHaveBeenCalledWith(
				'Политика в отношении обработки персональных данных',
				PrivacyComponent,
			);
		});
	});
});
