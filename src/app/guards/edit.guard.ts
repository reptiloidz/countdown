import { inject } from '@angular/core';
import { Event, ActivationEnd, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { AuthService, DataService } from '../services';

export const editGuard = () => {
	const auth = inject(AuthService);
	const dataService = inject(DataService);
	const router = inject(Router);
	let hasAccess = false;

	const guardSubscribe = router.events
		.pipe(filter((event: Event) => event instanceof ActivationEnd))
		.pipe(
			switchMap((data: any) => {
				hasAccess =
					data.snapshot.parent?.url?.[0]?.path === 'create-url' || data.snapshot.routeConfig?.path === 'create-url';
				return dataService.fetchPoint(data.snapshot.params.id);
			}),
		)
		.subscribe({
			next: point => {
				if (!hasAccess) {
					hasAccess = !!(point && auth.checkAccessEdit(point)) || !!(point && !point.id && auth.checkEmailVerified);
				}
				if (!hasAccess) {
					router.navigate(point?.id ? ['/point/', point.id] : ['/']);
				}
				auth.setEditPointAccess(point?.id, hasAccess);
				guardSubscribe.unsubscribe();
				return hasAccess;
			},
			error: err => {
				console.error('Ошибка при проверке доступа к редактированию события:\n', err.message);
			},
		});

	return guardSubscribe;
};
