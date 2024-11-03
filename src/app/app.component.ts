import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription, filter, first, interval, switchMap } from 'rxjs';
import { ActionService, NotifyService } from './services';
import { Notification } from './interfaces';
import { ActivationStart, Event, Router } from '@angular/router';
import {
	AUTO_STYLE,
	animate,
	group,
	query,
	style,
	transition,
	trigger,
} from '@angular/animations';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	animations: [
		trigger('notify', [
			transition(
				':enter',
				group([
					style({
						transform: 'translateY(10px)',
						opacity: 0,
						paddingTop: 0,
					}),
					animate(
						'.1s cubic-bezier(.1, .79, .24, .95)',
						style({
							transform: 'none',
						})
					),
					animate(
						'.4s cubic-bezier(.1, .79, .24, .95)',
						style({
							opacity: 1,
							paddingTop: 20,
						})
					),
					query('.notify-list__item', [
						style({
							height: 0,
						}),
						animate(
							'.4s cubic-bezier(.1, .79, .24, .95)',
							style({
								height: AUTO_STYLE,
							})
						),
					]),
				])
			),
			transition(
				':leave',
				group([
					animate(
						'.4s cubic-bezier(.1, .79, .24, .95)',
						style({
							transform: 'translateY(10px)',
							paddingTop: 0,
							opacity: 0,
						})
					),
					// animate(
					// 	'.1s cubic-bezier(.1, .79, .24, .95)',
					// 	style({
					// 	})
					// ),
					query('.notify-list__item', [
						style({
							height: AUTO_STYLE,
						}),
						animate(
							'.1s cubic-bezier(.1, .79, .24, .95)',
							style({
								height: 0,
							})
						),
					]),
				])
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
