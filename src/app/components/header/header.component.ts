import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { User } from '@angular/fire/auth';
import { NavigationEnd, Params, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService, PopupService } from 'src/app/services';
import { PrivacyComponent } from '../privacy/privacy.component';
import { SettingsComponent } from '../settings/settings.component';
import { environment } from 'src/environments/environment';
import { DonateComponent } from '../donate/donate.component';

@Component({
	selector: '[app-header]',
	templateUrl: './header.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
	constructor(
		private auth: AuthService,
		private router: Router,
		private popupService: PopupService,
		private cdr: ChangeDetectorRef,
	) {}

	private subscriptions = new Subscription();

	isMain = false;
	isPrivacy = false;
	isProfile = false;
	logoutLoading = false;
	mainLinkParams!: Params;
	user = signal<User | undefined>(undefined);
	isAuthenticated = signal(false);

	ngOnInit(): void {
		this.subscriptions.add(
			this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe({
				next: () => {
					const finalPath = this.router.lastSuccessfulNavigation?.finalUrl?.root.children['primary']?.segments[0].path;

					this.isMain = !finalPath;
					this.isPrivacy = finalPath !== 'privacy';
					this.isProfile = finalPath !== 'profile';
					this.mainLinkParams = {
						search: localStorage.getItem('searchInputValue') || null,
						sort: localStorage.getItem('sort') === 'titleAsc' ? null : localStorage.getItem('sort'),
						repeat: localStorage.getItem('repeatableValue') === 'all' ? null : localStorage.getItem('repeatableValue'),
						greenwich: localStorage.getItem('greenwichValue') === 'all' ? null : localStorage.getItem('greenwichValue'),
						public: localStorage.getItem('publicValue') === 'false' ? null : localStorage.getItem('publicValue'),
						color: localStorage.getItem('colorValue') === 'all' ? null : localStorage.getItem('colorValue'),
					};
					this.cdr.markForCheck();
				},
			}),
		);

		this.subscriptions.add(
			this.auth.currentUser.subscribe({
				next: data => {
					this.user.set(data as User);
					this.isAuthenticated.set(!!data);
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

	get isProd(): boolean {
		return environment.production;
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

	showDonate() {
		this.popupService.show('Помочь проекту', DonateComponent);
	}
}
