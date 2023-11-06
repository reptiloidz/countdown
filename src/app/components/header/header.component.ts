import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
	selector: '[app-header]',
	templateUrl: './header.component.html',
})
export class HeaderComponent {
	constructor(private auth: AuthService, private router: Router) {}

	get isAuthenticated() {
		return this.auth.isAuthenticated();
	}

	get isAuthorization() {
		return this.router.url === '/auth';
	}

	logout() {
		this.auth.logout();
	}
}
