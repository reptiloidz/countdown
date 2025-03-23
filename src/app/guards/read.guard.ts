import { inject } from '@angular/core';
import { Event, ActivationEnd, Router, ActivatedRoute } from '@angular/router';
import { filter, of, switchMap } from 'rxjs';
import { AuthService, DataService } from '../services';
import { getPointFromUrl } from '../helpers';

export const readGuard = () => {
	const auth = inject(AuthService);
	const dataService = inject(DataService);
	const router = inject(Router);
	const route = inject(ActivatedRoute);
	let hasAccess = false;

	const guardSubscribe = router.events
		.pipe(filter((event: Event) => event instanceof ActivationEnd))
		.pipe(
			switchMap((data: any) => {
				return data.snapshot.params.id
					? dataService.fetchPoint(data.snapshot.params.id)
					: of(getPointFromUrl(route.snapshot.queryParams));
			}),
		)
		.subscribe({
			next: point => {
				hasAccess = !!(point && (auth.checkAccessEdit(point) || point.public || (!point.user && !point.id)));
				if (!hasAccess) {
					router.navigate(['/']);
				}
				guardSubscribe.unsubscribe();
				return hasAccess;
			},
			error: err => {
				router.navigate(['/']);
				console.error('Ошибка доступа к просмотру события:\n', err.message);
			},
		});

	return guardSubscribe;
};
