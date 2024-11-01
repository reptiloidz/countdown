import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription, filter, first, interval, switchMap } from 'rxjs';
import { ActionService, NotifyService } from './services';
import { Notification } from './interfaces';
import { ActivationStart, Event, Router } from '@angular/router';
import {
	AUTO_STYLE,
	animate,
	style,
	transition,
	trigger,
} from '@angular/animations';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	animations: [
		trigger('notify', [
			transition(':enter', [
				style({
					transform: 'translateY(100%)',
					opacity: 0,
					height: 0,
					paddingTop: 0,
				}),
				animate(
					'.4s .1s cubic-bezier(.1, .79, .24, .95)',
					style({
						transform: 'none',
						opacity: 1,
						height: AUTO_STYLE,
						paddingTop: 20,
					})
				),
			]),
			transition(
				':leave',
				animate(
					'.4s cubic-bezier(.1, .79, .24, .95)',
					style({
						transform: 'translateY(100%)',
						opacity: 0,
						height: 0,
						paddingTop: 0,
					})
				)
			),
		]),
	],
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

	closeNotify(date: Date) {
		this.notify.close(date);
	}
}
