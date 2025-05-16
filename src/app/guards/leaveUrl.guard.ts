import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const leaveUrlGuard = () => {
	const router = inject(Router);

	if (
		router.lastSuccessfulNavigation?.finalUrl?.root.children['primary']?.segments[0].path === 'url' &&
		!router.lastSuccessfulNavigation.finalUrl.queryParams['date']
	) {
		return confirm('При покидании страницы с таймером, он сбрасывается. Точно уйти?');
	} else {
		return true;
	}
};
