import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { Notification } from '../interfaces/notification.interface';

@Injectable({
	providedIn: 'root',
})
export class NotifyService {
	constructor() {}

	private _timer = 5000;
	private _notificationsSubject = new BehaviorSubject<Notification[]>([]);
	notifications$ = this._notificationsSubject.asObservable();

	get notifications() {
		return this._notificationsSubject.getValue();
	}

	update(newList: Notification[]) {
		this._notificationsSubject.next(newList);
	}

	add<T extends boolean>(notification: Omit<Notification<T>, 'date'>) {
		const newNotification: Notification = {
			date: new Date(),
			title: notification.title,
			text: notification.text,
		};

		this._notificationsSubject.next([
			...this.notifications,
			newNotification,
		]);

		const newSubscription = timer(this._timer).subscribe({
			next: () => {
				this.update(
					this.notifications.filter(
						(i) => i.date !== newNotification.date
					)
				);
				newSubscription.unsubscribe();
			},
		});
	}
}
