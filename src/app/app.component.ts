import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotifyService } from './services/notify.service';
import { Notification } from './interfaces/notification.interface';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
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
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
