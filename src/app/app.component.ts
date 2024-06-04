import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { NotifyService } from './services';
import { Notification } from './interfaces';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
	count = 0;
	startTime = new Date();

	constructor(private notify: NotifyService) {}

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

		document.documentElement.style.setProperty(
			'--start-time',
			(+new Date()).toString()
		);

		interval(1000).subscribe({
			next: () => {
				document.documentElement.style.setProperty(
					'--count',
					(++this.count).toString()
				);
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
