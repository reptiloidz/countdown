import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const unauthGuard = () => {
	const auth = inject(AuthService);
	const router = inject(Router);
	let hasAccess = false;

	hasAccess = auth.isAuthenticated;

	if (!hasAccess) {
		router.navigate(['/auth']);
	}

	return hasAccess;
};
