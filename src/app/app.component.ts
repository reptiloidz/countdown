import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription, filter, first, interval, switchMap } from 'rxjs';
import { ActionService } from './services';
import { environment } from 'src/environments/environment';
import { Constants } from './enums';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	// changeDetection: ChangeDetectionStrategy.OnPush,
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

		interval(this.isProd ? 1 : Constants.tick)
			.pipe(
				filter(() => +new Date() % 1000 < 100),
				first(),
				switchMap(() => interval(1000)),
			)
			.subscribe({
				next: () => {
					document.documentElement.style.setProperty('--count', (++this.count).toString());

					this.action.intervalSwitched();
					this.cdr.detectChanges();
				},
			});
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
	// 		title: `Создано событие "<a [routerLink]="'/profile'" class="notify-list__link">С днем рождения</a>"`,
	// 		text: `Создано событие "<a href="../point/" class="notify-list__link">С днем рождения</a>"`,
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
