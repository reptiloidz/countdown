import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { User } from '@angular/fire/auth';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { BehaviorSubject, filter, Subscription } from 'rxjs';
import { AuthService, PopupService } from 'src/app/services';
import { PrivacyComponent } from '../privacy/privacy.component';
import { SettingsComponent } from '../settings/settings.component';

@Component({
	selector: '[app-header]',
	templateUrl: './header.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
	constructor(
		private auth: AuthService,
		private router: Router,
		private route: ActivatedRoute,
		private popupService: PopupService,
		private cdr: ChangeDetectorRef,
	) {}

	private subscriptions = new Subscription();

	isMain = false;
	isPrivacy = false;
	isProfile = false;
	logoutLoading = false;
	mainLinkParams!: Params;
	user$ = new BehaviorSubject<User | undefined>(undefined);
	isAuthenticated$ = new BehaviorSubject<boolean>(false);

	ngOnInit(): void {
		this.subscriptions.add(
			this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe({
				next: () => {
					const finalPath = this.router.lastSuccessfulNavigation?.finalUrl?.root.children['primary']?.segments[0].path;

					this.isMain = !finalPath;
					this.isPrivacy = finalPath !== 'privacy';
					this.isProfile = finalPath !== 'profile';
					this.cdr.detectChanges();
				},
			}),
		);

		this.subscriptions.add(
			this.route.queryParams.subscribe({
				next: () => {
					this.mainLinkParams = {
						search: localStorage.getItem('searchInputValue') || null,
						sort: localStorage.getItem('sort') === 'titleAsc' ? null : localStorage.getItem('sort'),
						repeat: localStorage.getItem('repeatableValue') === 'all' ? null : localStorage.getItem('repeatableValue'),
						greenwich: localStorage.getItem('greenwichValue') === 'all' ? null : localStorage.getItem('greenwichValue'),
						public: localStorage.getItem('publicValue') === 'all' ? null : localStorage.getItem('publicValue'),
						color: localStorage.getItem('colorValue') === 'all' ? null : localStorage.getItem('colorValue'),
					};
				},
			}),
		);

		this.subscriptions.add(
			this.auth.currentUser.subscribe({
				next: data => {
					this.user$.next(data as User);
					this.cdr.markForCheck();
					requestAnimationFrame(() => {
						this.isAuthenticated$.next(this.auth.isAuthenticated);
					});
				},
			}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get isAuthorization() {
		return this.router.url === '/auth';
	}

	showPrivacy() {
		this.popupService.show('Политика в отношении обработки персональных данных', PrivacyComponent);
	}

	check() {
		this.auth.checkIsAuth();
	}

	showSettings() {
		this.popupService.show('Настройки', SettingsComponent, {
			isPopup: true,
		});
	}

	logout() {
		this.logoutLoading = true;
		this.auth.logout().finally(() => {
			this.logoutLoading = false;
		});
	}
}
