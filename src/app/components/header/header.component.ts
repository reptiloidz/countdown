import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivationEnd, Event, Router } from '@angular/router';
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

	ngOnInit(): void {
		this.subscriptions.add(
			this.router.events
				.pipe(filter((event: Event) => event instanceof ActivationEnd))
				.subscribe({
					next: (data: any) => {
						this.isMain = !data.snapshot.url.length;
					},
				})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get isAuthenticated() {
		return this.auth.isAuthenticated();
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
