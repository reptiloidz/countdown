import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '@angular/fire/auth';
import { ActivationStart, Event, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
	selector: '[app-header]',
	templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
	constructor(private auth: AuthService, private router: Router) {}

	private subscriptions = new Subscription();

	isMain = false;
	isPrivacy = false;
	isProfile = false;
	user: User | undefined;

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

	check() {
		this.auth.checkIsAuth();
	}

	logout() {
		this.auth.logout();
	}
}
