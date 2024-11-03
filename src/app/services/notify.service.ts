import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { Notification } from '../interfaces';

@Injectable({
	providedIn: 'root',
})
export class NotifyService {
	constructor() {}

	private _timer = 10000;
	private _timerShort = 2000;
	private _notificationsSubject = new BehaviorSubject<Notification[]>([]);
	private _promptSubject!: Subject<string>;
	private promptElement!: HTMLInputElement;
	promptObservable$!: Observable<string>;
	notifications$ = this._notificationsSubject.asObservable();

	get notifications() {
		return this._notificationsSubject.getValue();
	}

	update(newList: Notification[]) {
		this._notificationsSubject.next(newList);
	}

	prompt<T extends boolean>(
		notification: Omit<Notification<T>, 'date'>
	): Observable<string> {
		const newNotificationDate = this.add(notification);

		this._promptSubject = new Subject<string>();
		this.promptObservable$ = this._promptSubject.asObservable();
		requestAnimationFrame(() => {
			this.promptElement = document.documentElement.querySelector(
				`#n-${+newNotificationDate} input`
			) as HTMLInputElement;
			this.promptElement.focus();
		});
		return this.promptObservable$;
	}

	add<T extends boolean>(notification: Omit<Notification<T>, 'date'>): Date {
		const newNotification: Notification = {
			date: new Date(),
			title: notification.title,
			text: notification.text,
			type: notification.type || 'neutral',
			autoremove: notification.autoremove,
			short: notification.short,
			prompt: notification.prompt,
			confirm: notification.confirm,
			button: notification.button,
		};

		this._notificationsSubject.next([
			...this.notifications,
			newNotification,
		]);

		const newSubscription =
			(notification.autoremove || notification.short) &&
			timer(
				notification.short ? this._timerShort : this._timer
			).subscribe({
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
		this._promptSubject?.unsubscribe();
		this.update(this.notifications.filter((i) => i.date !== date));
	}

	submit(date: Date) {
		this.promptElement.value &&
			this._promptSubject.next(this.promptElement.value);
		this.close(date);
	}
}
