import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { differenceInMinutes } from 'date-fns';
import { Subscription } from 'rxjs';
import { parseDate, sortDates } from 'src/app/helpers';
import { Iteration, Point } from 'src/app/interfaces';

@Component({
	selector: 'app-mode-stats',
	templateUrl: './mode-stats.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeStatsComponent implements OnInit, OnDestroy {
	@Input() point!: Point;

	dates = signal<Iteration[]>([]);
	modeSumFirst = signal(0);
	modeSumSecond = signal(0);
	startDate = signal(new Date());
	finalDate = signal(new Date());
	startIteration = true;
	lastMode: 'first' | 'second' = 'second';

	private subscriptions = new Subscription();

	constructor() {}

	ngOnInit(): void {
		this.dates.set(sortDates(this.point).dates);

		let prevDate = new Date();
		let currDate = new Date();

		this.dates().forEach((iteration, i) => {
			currDate = parseDate(iteration.date);

			if (this.startIteration) {
				prevDate = currDate;
			}

			if (prevDate !== currDate) {
				const difference = differenceInMinutes(currDate, prevDate);
				if (this.lastMode === 'first') {
					this.modeSumSecond.set(this.modeSumSecond() + difference);
					this.lastMode = 'second';
				} else {
					this.modeSumFirst.set(this.modeSumFirst() + difference);
					this.lastMode = 'first';
				}
				prevDate = currDate;
			}

			// TODO: добавить ограничение диапазона, календари, свитчер
			// TODO: добавить отображение в разных форматах (годы, месяцы, недели, дни, часы, минуты)

			this.startIteration && (this.startIteration = false);
		});
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
