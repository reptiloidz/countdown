import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services';

export const unauthGuard = () => {
	const auth = inject(AuthService);
	const router = inject(Router);
	let hasAccess = false;

	hasAccess = auth.isAuthenticated;

	// Пока отключу редирект на авторизацию, мешает при коротких ссылках
	// if (!hasAccess) {
	// 	router.navigate(['/auth']);
	// }

	return hasAccess;
};
