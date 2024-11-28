import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, take, timer } from 'rxjs';
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
	private _confirmSubject!: Subject<boolean>;
	private promptInput: HTMLInputElement | undefined;
	private confirmButton!: HTMLButtonElement;
	promptObservable$!: Observable<string>;
	confirmObservable$!: Observable<boolean>;
	notifications$ = this._notificationsSubject.asObservable();

	get notifications() {
		return this._notificationsSubject.getValue();
	}

	get notificationsOpened(): boolean {
		return !!document.documentElement.querySelectorAll(
			'.notify-list__item-wrapper'
		).length;
	}

	update(newList: Notification[]) {
		this._notificationsSubject.next(newList);
	}

	prompt<T extends boolean>(
		notification: Omit<Notification<T>, 'date'>
	): Observable<string> {
		notification.prompt = true;
		const newNotificationDate = this.add(notification);

		this._promptSubject = new Subject<string>();
		this.promptObservable$ = this._promptSubject
			.asObservable()
			.pipe(take(1));
		requestAnimationFrame(() => {
			this.promptInput = document.documentElement.querySelector(
				`#n-${+newNotificationDate} input`
			) as HTMLInputElement;
			this.promptInput.focus();
		});
		return this.promptObservable$;
	}

	confirm<T extends boolean>(
		notification: Omit<Notification<T>, 'date'>
	): Observable<boolean> {
		notification.confirm = true;
		const newNotificationDate = this.add(notification);

		this._confirmSubject = new Subject<boolean>();
		this.confirmObservable$ = this._confirmSubject
			.asObservable()
			.pipe(take(1));
		requestAnimationFrame(() => {
			this.confirmButton = document.documentElement.querySelector(
				`#n-${+newNotificationDate} .notify-list__submit`
			) as HTMLButtonElement;
			this.confirmButton.focus();
		});
		return this.confirmObservable$;
	}

	add<T extends boolean>(notification: Omit<Notification<T>, 'date'>): Date {
		const newNotification: Notification = {
			date: new Date(),
			title: notification.title,
			text: notification.text,
			view: notification.view || 'neutral',
			autoremove: notification.autoremove,
			short: notification.short,
			prompt: notification.prompt,
			confirm: notification.confirm,
			button: notification.button,
			icon: notification.icon,
			type: notification.type,
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

	unsubscribe(date?: Date) {
		if (date) {
			this.notifications.some(
				(item) => item.prompt && date === item.date
			) && this._promptSubject?.unsubscribe();
			this.notifications.some(
				(item) => item.confirm && date === item.date
			) && this._confirmSubject?.unsubscribe();
		} else {
			this.notifications.some((item) => item.prompt) &&
				this._promptSubject?.unsubscribe();
			this.notifications.some((item) => item.confirm) &&
				this._confirmSubject?.unsubscribe();
		}
		this.promptInput = undefined;
	}

	close(date: Date) {
		this.update(this.notifications.filter((i) => i.date !== date));
		this.unsubscribe(date);
	}

	closeModals() {
		this.update(this.notifications.filter((i) => !i.confirm && !i.prompt));
		this.unsubscribe();
	}

	submit(date: Date) {
		if (this.promptInput) {
			this.promptInput.value &&
				this._promptSubject.next(this.promptInput.value);
		} else {
			this._confirmSubject.next(true);
		}
		this.close(date);
	}
}
