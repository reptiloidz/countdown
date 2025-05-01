import { ChangeDetectionStrategy, Component, HostBinding, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { differenceInMinutes, endOfYear, startOfYear, subYears } from 'date-fns';
import { Subscription } from 'rxjs';
import { parseDate, sortDates } from 'src/app/helpers';
import { Iteration, Point, SwitcherItem } from 'src/app/interfaces';

@Component({
	selector: 'app-mode-stats',
	templateUrl: './mode-stats.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeStatsComponent implements OnInit, OnDestroy {
	@Input() point!: Point;
	@HostBinding('class') class = 'mode-stats';

	dates = signal<Iteration[]>([]);
	modeSumFirst = signal(0);
	modeSumSecond = signal(0);
	startDate = signal(new Date());
	finalDate = signal(new Date());
	firstIterationDate = signal(new Date());
	lastIterationDate = signal(new Date());
	isStartIteration = true;
	isFinalIteration = false;
	isFutureNow = false;
	currentMode: 'first' | 'second' = 'first';

	modeList: SwitcherItem[] = [
		{
			text: 'Всё время',
			value: 'all',
		},
		{
			text: 'Последний год',
			value: 'year',
		},
		{
			text: 'С начала года',
			value: 'currentYear',
		},
		{
			text: 'Прошлый год',
			value: 'lastYear',
		},
		{
			text: 'До последней итерации',
			value: 'toLast',
		},
	];
	activeMode = 'all';

	private subscriptions = new Subscription();

	constructor() {}

	ngOnInit(): void {
		this.dates.set(sortDates(this.point).dates);

		this.firstIterationDate.set(parseDate(this.dates()[0].date));
		this.lastIterationDate.set(parseDate(this.dates()[this.dates().length - 1].date));

		this.limitDates();
	}

	get now() {
		return new Date();
	}

	reset() {
		this.isStartIteration = true;
		this.modeSumFirst.set(0);
		this.modeSumSecond.set(0);
		this.currentMode = 'first';
		this.isFutureNow = false;
	}

	getIterationModeIcon(date: Date) {
		return this.point.dates.find(iteration => +parseDate(iteration.date) === +date)?.mode?.icon;
	}

	getIterationModeName(date: Date) {
		return this.point.dates.find(iteration => +parseDate(iteration.date) === +date)?.mode?.name;
	}

	limitDates(firstDate = this.firstIterationDate(), lastDate = this.now) {
		this.reset();

		this.startDate.set(firstDate);
		this.finalDate.set(lastDate);

		let previousDate = new Date(0);
		let nextItem = 0;

		for (let iteration of this.dates()) {
			nextItem++;
			let currentDate = parseDate(iteration.date);
			const isOtherMode =
				this.getIterationModeName(previousDate) !== this.getIterationModeName(currentDate) &&
				this.getIterationModeIcon(previousDate) !== this.getIterationModeIcon(currentDate);

			if (isOtherMode) {
				if (this.currentMode === 'first') {
					this.currentMode = 'second';
				} else {
					this.currentMode = 'first';
				}
			}

			if (+currentDate < +firstDate) {
				if (+parseDate(this.dates()[nextItem]?.date) > +firstDate) {
					currentDate = firstDate;
				} else {
					previousDate = currentDate;
					continue;
				}
			}

			if (+currentDate >= +lastDate) {
				this.isFinalIteration = true;
				currentDate = lastDate;
			}

			if (+currentDate < +lastDate && this.dates().length === nextItem) {
				this.isFinalIteration = true;
				this.isFutureNow = true;
			}

			if (this.isStartIteration) {
				previousDate = currentDate;
			}

			const difference = differenceInMinutes(currentDate, previousDate);
			if (isOtherMode) {
				if (this.currentMode === 'first') {
					this.modeSumFirst.set(this.formatDate(this.modeSumFirst() + difference));
					if (this.isFutureNow) {
						this.modeSumSecond.set(this.formatDate(this.modeSumSecond() + differenceInMinutes(lastDate, currentDate)));
					}
				} else {
					this.modeSumSecond.set(this.formatDate(this.modeSumSecond() + difference));
					if (this.isFutureNow) {
						this.modeSumFirst.set(this.formatDate(this.modeSumFirst() + differenceInMinutes(lastDate, currentDate)));
					}
				}
			}

			previousDate = currentDate;

			// TODO: добавить ограничение диапазона, календари, свитчер, сбрасывать свитчер, если дата изменена вручную
			// TODO: учитывать часовой пояс
			// TODO: добавить отображение в разных форматах (годы, месяцы, недели, дни, часы, минуты)

			this.isStartIteration && (this.isStartIteration = false);
			if (this.isFinalIteration) {
				this.isFinalIteration = false;
				return;
			}
		}
	}

	formatDate(minutes: number) {
		return Math.floor(minutes / 60 / 24);
	}

	setStartDate(date: Date) {
		this.limitDates(date);
	}

	setFinalDate(date: Date) {
		this.limitDates(this.startDate(), date);
	}

	switchMode(mode: string) {
		let startDate: Date;
		let finalDate: Date;

		switch (mode) {
			case 'year':
				startDate = subYears(this.now, 1);
				finalDate = this.now;
				break;

			case 'currentYear':
				startDate = startOfYear(this.now);
				finalDate = this.now;
				break;

			case 'lastYear':
				startDate = startOfYear(subYears(this.now, 1));
				finalDate = endOfYear(subYears(this.now, 1));
				break;

			case 'toLast':
				startDate = this.firstIterationDate();
				finalDate = this.lastIterationDate();
				break;

			default:
				startDate = this.firstIterationDate();
				finalDate = this.now;
				break;
		}
		this.limitDates(startDate, finalDate);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
