import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActionService, HttpService, NotifyService } from '../services';

export const shortGuard = () => {
	const http = inject(HttpService);
	const router = inject(Router);
	const action = inject(ActionService);
	const notify = inject(NotifyService);

	const guardSubscribe = http.getFullLink(window.location.pathname.slice(1)).subscribe({
		next: link => {
			const queryParams: { [key: string]: string } = {};
			new URLSearchParams(link).forEach((value, key) => {
				queryParams[key] = value;
			});

			if (link) {
				router.navigate(['/url/'], {
					queryParams,
					replaceUrl: true,
				});
				return false;
			} else {
				return true;
			}
		},
		error: () => {
			notify.add({
				view: 'negative',
				short: true,
				title: 'Нет такой ссылки, даже короткой.',
			});
			action.shortLinkChecked();
		},
	});

	return guardSubscribe;
};
