import { inject } from '@angular/core';
import { Event, ActivationEnd, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { DataService } from './data.service';

export const editGuard = () => {
	const auth = inject(AuthService);
	const dataService = inject(DataService);
	const router = inject(Router);
	let hasAccess = false;

	return router.events
		.pipe(filter((event: Event) => event instanceof ActivationEnd))
		.pipe(
			switchMap((data: any) => {
				return dataService.fetchPoint(data.snapshot.params.id);
			})
		)
		.subscribe({
			next: (point) => {
				hasAccess =
					!!(point && auth.checkAccessEdit(point)) ||
					!!(point && !point.id && auth.checkEmailVerified);
				if (!hasAccess) {
					router.navigate(point?.id ? ['/point/', point.id] : ['/']);
				}
				auth.setEditPointAccess(point?.id, hasAccess);
				return hasAccess;
			},
			error: (err) => {
				console.error(
					'Ошибка при проверке доступа к редактированию события:\n',
					err.message
				);
			},
		});
};
