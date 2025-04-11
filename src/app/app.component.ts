/**
 * The root component of the application.
 *
 * This component is responsible for managing the application's main logic,
 * including handling visibility changes, managing intervals, and updating
 * the DOM with runtime properties.
 *
 * @remarks
 * - Utilizes Angular's OnPush change detection strategy for performance optimization.
 * - Subscribes to an interval observable to update the `--count` CSS variable.
 * - Handles visibility changes to adjust the count based on elapsed time.
 *
 * @example
 * ```html
 * <app-root></app-root>
 * ```
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { ActionService } from './services';
import { environment } from 'src/environments/environment';
import { Constants } from './enums';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
	count = 0;
	startTime = new Date();

	constructor(
		private action: ActionService,
		private cdr: ChangeDetectorRef,
	) {}

	private subscriptions = new Subscription();

	@HostListener('document:visibilitychange', ['$event'])
	visibilitychange() {
		this.changeVisibilityHandler();
	}

	ngOnInit(): void {
		document.documentElement.style.setProperty('--start-time', (+new Date()).toString());

		setTimeout(
			() => {
				this.subscriptions.add(
					interval(this.isProd ? 1000 : Constants.tick).subscribe({
						next: () => {
							document.documentElement.style.setProperty('--count', (++this.count).toString());

							this.action.intervalSwitched();
							this.cdr.detectChanges();
						},
					}),
				);
			},
			1000 - (Date.now() % 1000),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get isProd(): boolean {
		return environment.production;
	}

	changeVisibilityHandler() {
		if (!document.hidden) {
			const newDate = new Date();
			this.count = Math.floor((+newDate - +this.startTime) / 1000);
		}
	}

	// toast() {
	// 	this.notify.add({
	// 		title: "Создано событие",
	// 		component: BirthdayPointComponent,
	// 		inputs: {
	// 			pointId: '111',
	// 			pointName: 'С днем рождения',
	// 		},
	// 		view: 'positive',
	// 	});

	// this.notify
	// 	.prompt({
	// 		title: 'Пример промпта?',
	// 	})
	// 	.subscribe({
	// 		next: (result) => {
	// 			console.log(result);
	// 		},
	// 	});

	// this.notify.confirm({
	// 	title: 'Пример конфёрма?',
	// 	button: 'Да'
	// }).subscribe({
	// 	next: result => {
	// 		console.log(result);
	// 	}
	// });

	// this.notify.add({
	// 	title: 'Нотифай',
	// 	text: 'Описание нотифая'
	// });

	// this.notify.add({
	// 	title: 'Саксесс',
	// 	type: 'positive'
	// });

	// this.notify.add({
	// 	title: 'Эррор"',
	// 	type: 'negative'
	// });
	// }
}
