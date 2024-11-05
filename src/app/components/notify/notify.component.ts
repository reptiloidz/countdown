import {
	animate,
	AUTO_STYLE,
	group,
	query,
	style,
	transition,
	trigger,
} from '@angular/animations';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notification } from 'src/app/interfaces';
import { NotifyService } from 'src/app/services';

@Component({
	selector: 'app-notify',
	templateUrl: './notify.component.html',
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
export class NotifyComponent implements OnInit, OnDestroy {
	constructor(private notify: NotifyService) {}

	public notifyList: Notification[] = [];
	private subscriptions = new Subscription();

	@HostListener('document:keydown.escape')
	onEscapeKeydown() {
		this.notify.closeModals();
	}

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

	closeNotify(date: Date) {
		this.notify.close(date);
	}

	submitNotify(date: Date) {
		this.notify.submit(date);
	}
}
