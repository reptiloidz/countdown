import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { Notification } from '../interfaces';

@Injectable({
	providedIn: 'root',
})
export class NotifyService {
	constructor() {}

	private _timer = 10000;
	private _notificationsSubject = new BehaviorSubject<Notification[]>([]);
	notifications$ = this._notificationsSubject.asObservable();

	get notifications() {
		return this._notificationsSubject.getValue();
	}

	update(newList: Notification[]) {
		this._notificationsSubject.next(newList);
	}

	add<T extends boolean>(notification: Omit<Notification<T>, 'date'>): Date {
		const newNotification: Notification = {
			date: new Date(),
			title: notification.title,
			text: notification.text,
			type: notification.type || 'neutral',
			autoremove: notification.autoremove,
		};

		this._notificationsSubject.next([
			...this.notifications,
			newNotification,
		]);

		const newSubscription =
			notification.autoremove &&
			timer(this._timer).subscribe({
				next: () => {
					this.update(
						this.notifications.filter(
							(i) => i.date !== newNotification.date
						)
					);
					newSubscription && newSubscription.unsubscribe();
				},
			});

		return newNotification.date;
	}

	close(date: Date) {
		this.update(this.notifications.filter((i) => i.date !== date));
	}
}
