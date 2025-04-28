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
	firstIterationDate = signal(new Date());
	lastIterationDate = signal(new Date());
	isStartIteration = true;
	isFinalIteration = false;
	lastMode: 'first' | 'second' = 'second';

	private subscriptions = new Subscription();

	constructor() {}

	ngOnInit(): void {
		this.dates.set(sortDates(this.point).dates);

		this.firstIterationDate.set(parseDate(this.dates()[0].date));
		this.lastIterationDate.set(parseDate(this.dates()[this.dates().length - 1].date));

		this.limitDates();
	}

	limitDates(firstDate = this.firstIterationDate(), lastDate = this.lastIterationDate()) {
		this.isStartIteration = true;
		this.startDate.set(firstDate);
		this.finalDate.set(lastDate);

		this.modeSumFirst.set(0);
		this.modeSumSecond.set(0);

		let prevDate = new Date();
		let nextItem = 0;

		for (let iteration of this.dates()) {
			nextItem++;
			let currDate = parseDate(iteration.date);

			if (+currDate < +firstDate) {
				if (+parseDate(this.dates()[nextItem].date) > +firstDate) {
					currDate = firstDate;
				} else {
					continue;
				}
			}

			if (+currDate > +lastDate) {
				currDate = lastDate;
				this.isFinalIteration = true;
			}

			if (this.isStartIteration) {
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

			this.isStartIteration && (this.isStartIteration = false);
			if (this.isFinalIteration) {
				this.isFinalIteration = false;
				return;
			}
		}
	}

	setStartDate(date: Date) {
		this.limitDates(date);

		this.log();
	}

	setFinalDate(date: Date) {
		this.limitDates(this.startDate(), date);
		this.log();
	}

	log() {
		console.log(this.startDate());
		console.log(this.finalDate());
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
