import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard = () => {
	const auth = inject(AuthService);
	const router = inject(Router);
	let hasAccess = false;

	hasAccess = !auth.isAuthenticated;

	if (!hasAccess) {
		router.navigate(['/']);
	}

	return hasAccess;
};
