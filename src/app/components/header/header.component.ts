import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '@angular/fire/auth';
import {
	ActivatedRoute,
	ActivationStart,
	Event,
	Params,
	Router,
} from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService, PopupService } from 'src/app/services';
import { PrivacyComponent } from '../privacy/privacy.component';

@Component({
	selector: '[app-header]',
	templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
	constructor(
		private auth: AuthService,
		private router: Router,
		private route: ActivatedRoute,
		private popupService: PopupService
	) {}

	private subscriptions = new Subscription();

	isMain = false;
	isPrivacy = false;
	isProfile = false;
	logoutLoading = false;
	user: User | undefined;
	mainLinkParams!: Params;

	ngOnInit(): void {
		this.subscriptions.add(
			this.router.events
				.pipe(
					filter((event: Event) => event instanceof ActivationStart)
				)
				.subscribe({
					next: (data: any) => {
						this.isMain = !data.snapshot.url.length;
						this.isPrivacy =
							data.snapshot.url[0]?.path !== 'privacy';
						this.isProfile =
							data.snapshot.url[0]?.path !== 'profile';
					},
				})
		);

		this.route.queryParams.subscribe({
			next: () => {
				this.mainLinkParams = {
					search: localStorage.getItem('searchInputValue') || null,
					sort:
						localStorage.getItem('sort') === 'titleAsc'
							? null
							: localStorage.getItem('sort'),
					repeat:
						localStorage.getItem('repeatableValue') === 'all'
							? null
							: localStorage.getItem('repeatableValue'),
					greenwich:
						localStorage.getItem('greenwichValue') === 'all'
							? null
							: localStorage.getItem('greenwichValue'),
					public:
						localStorage.getItem('publicValue') === 'all'
							? null
							: localStorage.getItem('publicValue'),
					color:
						localStorage.getItem('colorValue') === 'all'
							? null
							: localStorage.getItem('colorValue'),
				};
			},
		});

		this.subscriptions.add(
			this.auth.currentUser.subscribe({
				next: (data) => {
					this.user = data as User;
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get isAuthenticated() {
		return this.auth.isAuthenticated;
	}

	get isAuthorization() {
		return this.router.url === '/auth';
	}

	showPrivacy() {
		this.popupService.show(
			'Политика в отношении обработки персональных данных',
			PrivacyComponent
		);
	}

	check() {
		this.auth.checkIsAuth();
	}

	logout() {
		this.logoutLoading = true;
		this.auth
			.logout()
			.then(() => {
				this.logoutLoading = false;
			})
			.catch(() => {
				this.logoutLoading = false;
			});
	}
}
