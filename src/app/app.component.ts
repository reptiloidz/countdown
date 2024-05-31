import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { NotifyService } from './services';
import { Notification } from './interfaces';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
	count = 0;

	constructor(private notify: NotifyService) {}

	public notifyList: Notification[] = [];
	private subscriptions = new Subscription();

	ngOnInit(): void {
		this.subscriptions.add(
			this.notify.notifications$.subscribe({
				next: (list) => {
					this.notifyList = list;
				},
			})
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
}
