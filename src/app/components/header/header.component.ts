import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
	selector: '[app-header]',
	templateUrl: './header.component.html',
})
export class HeaderComponent {
	constructor(private auth: AuthService) {}

	get isAuthenticated() {
		return this.auth.isAuthenticated();
	}

	logout() {
		this.auth.logout();
	}
}
