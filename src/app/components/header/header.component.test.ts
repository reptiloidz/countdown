import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Router, ActivatedRoute, Event, NavigationEnd } from '@angular/router';
import { AuthService, PopupService } from 'src/app/services';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { User } from '@angular/fire/auth';
import { PrivacyComponent } from '../privacy/privacy.component';
import { BoardComponent } from '../board/board.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeaderComponent', () => {
	let component: HeaderComponent;
	let fixture: ComponentFixture<HeaderComponent>;
	let router: Router;
	let route: ActivatedRoute;
	let authService: AuthService;
	let popupService: PopupService;

	beforeAll(() => {
		(window as any).IntersectionObserver = jest.fn(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		}));
	});

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [HeaderComponent, BoardComponent],
			providers: [
				{ provide: Router, useValue: { events: new Subject<Event>(), url: '/home', navigate: jest.fn() } },
				{ provide: ActivatedRoute, useValue: { queryParams: of({}) } },
				{
					provide: AuthService,
					useValue: {
						getUserData: jest.fn(),
						eventEditAccessCheck$: new BehaviorSubject({ pointId: null, access: true }),
						currentUser: new Subject(),
						checkIsAuth: jest.fn(),
						logout: jest.fn().mockResolvedValue(Promise.resolve()),
					},
				},
				{ provide: PopupService, useValue: { show: jest.fn() } },
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		router = TestBed.inject(Router);
		route = TestBed.inject(ActivatedRoute);
		authService = TestBed.inject(AuthService);
		popupService = TestBed.inject(PopupService);

		fixture = TestBed.createComponent(HeaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should initialize with default values', () => {
			component.ngOnInit();

			expect(component.isMain).toBeFalsy();
			expect(component.isProfile).toBeFalsy();
			expect(component.logoutLoading).toBeFalsy();
		});

		it('should update isMain and isProfile based on router events', () => {
			const event = new NavigationEnd(0, '', '');
			(router.events as Subject<Event>).next(event);

			expect(component.isMain).toBeTruthy();
			expect(component.isProfile).toBeTruthy();
		});

		it('should update mainLinkParams based on queryParams', () => {
			localStorage.setItem('searchInputValue', 'test');
			localStorage.setItem('sort', 'titleAsc');
			localStorage.setItem('repeatableValue', 'all');
			localStorage.setItem('greenwichValue', 'all');
			localStorage.setItem('publicValue', 'all');
			localStorage.setItem('colorValue', 'all');

			component.ngOnInit();

			expect(component.mainLinkParams).toEqual({
				search: 'test',
				sort: null,
				repeat: null,
				greenwich: null,
				public: null,
				color: null,
			});
		});

		it('should subscribe to auth.currentUser and update user', () => {
			const user: User = { uid: '123', email: 'test@example.com' } as User;
			(authService.currentUser as Subject<User>).next(user);

			expect(component.user()).toEqual(user);
		});
	});

	describe('ngOnDestroy', () => {
		it('should unsubscribe from all subscriptions', () => {
			const spy = jest.spyOn(component['subscriptions'], 'unsubscribe');
			component.ngOnDestroy();
			expect(spy).toHaveBeenCalled();
		});
	});

	describe('isAuthenticated', () => {
		it('should return auth.isAuthenticated', () => {
			expect(component.isAuthenticated()).toBe(!!authService.isAuthenticated);
		});
	});

	describe('isAuthorization', () => {
		it('should return true if router.url is /auth', () => {
			(router as any).url = '/auth';
			expect(component.isAuthorization).toBeTruthy();
		});

		it('should return false if router.url is not /auth', () => {
			(router as any).url = '/home';
			expect(component.isAuthorization).toBeFalsy();
		});
	});

	describe('showPrivacy', () => {
		it('should call popupService.show with correct arguments', () => {
			component.showPrivacy();
			expect(popupService.show).toHaveBeenCalledWith(
				'Политика в отношении обработки персональных данных',
				PrivacyComponent,
			);
		});
	});

	describe('check', () => {
		it('should call auth.checkIsAuth', () => {
			component.check();
			expect(authService.checkIsAuth).toHaveBeenCalled();
		});
	});

	describe('logout', () => {
		it('should set logoutLoading to true and call auth.logout', async () => {
			await component.logout();
			expect(component.logoutLoading).toBeFalsy();
			expect(authService.logout).toHaveBeenCalled();
		});

		it('should set logoutLoading to false if logout fails', async () => {
			jest.spyOn(authService, 'logout').mockRejectedValueOnce(new Error('Logout failed'));
			await component.logout();
			expect(component.logoutLoading).toBeFalsy();
		});
	});
});
