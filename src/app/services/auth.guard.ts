import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard = () => {
	const auth = inject(AuthService);
	let isAuth = false;
	if (auth.isAuthenticated()) {
		isAuth = true;
	} else {
		auth.logout();
	}
	return isAuth;
};
