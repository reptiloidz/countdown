import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription, filter, first, interval, switchMap } from 'rxjs';
import { ActionService, NotifyService } from './services';
import { Notification } from './interfaces';
import { ActivationStart, Event, Router } from '@angular/router';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
	count = 0;
	startTime = new Date();
	isUrlMode = false;

	constructor(
		private notify: NotifyService,
		private action: ActionService,
		private router: Router
	) {}

	public notifyList: Notification[] = [];
	private subscriptions = new Subscription();

	@HostListener('document:visibilitychange', ['$event'])
	visibilitychange() {
		this.changeVisibilityHandler();
	}

	ngOnInit(): void {
		this.subscriptions.add(
			this.notify.notifications$.subscribe({
				next: (list) => {
					this.notifyList = list;
				},
			})
		);

		this.subscriptions.add(
			this.router.events
				.pipe(
					filter((event: Event) => event instanceof ActivationStart)
				)
				.subscribe({
					next: (data: any) => {
						this.isUrlMode = data.snapshot.url[0]?.path === 'url';
					},
				})
		);

		document.documentElement.style.setProperty(
			'--start-time',
			(+new Date()).toString()
		);

		interval(1)
			.pipe(
				filter(() => +new Date() % 1000 < 100),
				first(),
				switchMap(() => interval(1000))
			)
			.subscribe({
				next: () => {
					document.documentElement.style.setProperty(
						'--count',
						(++this.count).toString()
					);

					this.action.intervalSwitched();
				},
			});
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	changeVisibilityHandler() {
		if (!document.hidden) {
			const newDate = new Date();
			this.count = Math.floor((+newDate - +this.startTime) / 1000);
		}
	}
}
