import { inject } from '@angular/core';
import { Event, ActivationEnd, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { DataService } from './data.service';

export const readGuard = () => {
	const auth = inject(AuthService);
	const dataService = inject(DataService);
	const router = inject(Router);
	let hasAccess = false;

	const guardSubscribe = router.events
		.pipe(filter((event: Event) => event instanceof ActivationEnd))
		.pipe(
			switchMap((data: any) => {
				return dataService.fetchPoint(data.snapshot.params.id);
			})
		)
		.subscribe({
			next: (point) => {
				hasAccess = !!(
					point &&
					(auth.checkAccessEdit(point) || point.public)
				);
				if (!hasAccess) {
					router.navigate(['/']);
				}
				guardSubscribe.unsubscribe();
				return hasAccess;
			},
			error: (err) => {
				router.navigate(['/']);
				console.error(
					'Ошибка доступа к просмотру события:\n',
					err.message
				);
			},
		});

	return guardSubscribe;
};
