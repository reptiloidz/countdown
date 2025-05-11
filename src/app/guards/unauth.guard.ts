import { inject } from '@angular/core';
import { AuthService } from '../services';

export const unauthGuard = () => {
	const auth = inject(AuthService);
	let hasAccess = false;

	hasAccess = auth.isAuthenticated;

	return hasAccess;
};
