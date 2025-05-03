import { ChangeDetectionStrategy, Component, HostBinding, Input, signal } from '@angular/core';
import { differenceInMinutes, endOfYear, formatDuration, startOfYear, subMinutes, subYears } from 'date-fns';
import { ru } from 'date-fns/locale';
import { parseDate, sortDates } from 'src/app/helpers';
import { Iteration, Point, SwitcherItem } from 'src/app/interfaces';

@Component({
	selector: 'app-mode-stats',
	templateUrl: './mode-stats.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeStatsComponent {
	@Input() point!: Point;
	@HostBinding('class') class = 'mode-stats';

	dates = signal<Iteration[]>([]);
	modeSumFirst = signal(0);
	modeSumSecond = signal(0);
	modeSumFirstFormatted = signal('');
	modeSumSecondFormatted = signal('');
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
			text: 'Поныне',
			value: 'toNow',
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
	activeMode = localStorage.getItem('statMode') ?? 'toNow';

	formatList: SwitcherItem[] = [
		{
			text: 'Годы',
			value: 'years',
		},
		{
			text: 'Месяцы',
			value: 'months',
		},
		{
			text: 'Недели',
			value: 'weeks',
		},
		{
			text: 'Дни',
			value: 'days',
		},
		{
			text: 'Часы',
			value: 'hours',
		},
		{
			text: 'Минуты',
			value: 'minutes',
		},
	];
	activeFormat = localStorage.getItem('statFormat') ?? 'minutes';
	formatValue = 1;
	formatName: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years' = 'minutes';

	ngOnInit(): void {
		this.dates.set(sortDates(this.point).dates);

		this.firstIterationDate.set(parseDate(this.dates()[0].date));
		this.lastIterationDate.set(parseDate(this.dates()[this.dates().length - 1].date));

		this.switchMode(this.activeMode);
	}

	get now() {
		return new Date();
	}

	get firstDisable() {
		return subMinutes(this.firstIterationDate(), 1);
	}

	reset() {
		this.isStartIteration = true;
		this.modeSumFirst.set(0);
		this.modeSumSecond.set(0);
		this.currentMode = 'first';
		this.isFutureNow = false;
	}

	isFirstMode(currentIteration: Iteration) {
		return (
			this.dates()[0].mode?.name !== currentIteration.mode?.name &&
			this.dates()[0].mode?.icon !== currentIteration.mode?.icon
		);
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
			const isNextDateAfterFirst = +parseDate(this.dates()[nextItem]?.date) > +firstDate;

			if (+currentDate < +firstDate) {
				if (isNextDateAfterFirst) {
					currentDate = firstDate;
				} else {
					previousDate = currentDate;
					this.isStartIteration && (this.isStartIteration = false);
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
			if (
				((this.dates()[nextItem - 2]?.mode?.name !== this.dates()[nextItem - 1].mode?.name &&
					this.dates()[nextItem - 2]?.mode?.icon !== this.dates()[nextItem - 1].mode?.icon &&
					difference) ||
					this.isFutureNow) &&
				isNextDateAfterFirst
			) {
				if (this.isFirstMode(this.dates()[nextItem - 1])) {
					this.modeSumFirst.set(this.modeSumFirst() + difference);
					if (this.isFutureNow) {
						this.modeSumSecond.set(this.modeSumSecond() + differenceInMinutes(lastDate, currentDate));
					}
				} else {
					this.modeSumSecond.set(this.modeSumSecond() + difference);
					if (this.isFutureNow) {
						this.modeSumFirst.set(this.modeSumFirst() + differenceInMinutes(lastDate, currentDate));
					}
				}
			}
			previousDate = currentDate;

			this.isStartIteration && (this.isStartIteration = false);
			if (this.isFinalIteration) {
				this.isFinalIteration = false;
				this.modeSumFirstFormatted.set(this.formatDate(this.modeSumFirst()));
				this.modeSumSecondFormatted.set(this.formatDate(this.modeSumSecond()));
				return;
			}
		}
	}

	formatDate(minutes: number) {
		const value = Math.floor(minutes / this.formatValue);
		return formatDuration(
			{
				years: this.formatName === 'years' ? value : 0,
				months: this.formatName === 'months' ? value : 0,
				weeks: this.formatName === 'weeks' ? value : 0,
				days: this.formatName === 'days' ? value : 0,
				hours: this.formatName === 'hours' ? value : 0,
				minutes: this.formatName === 'minutes' ? value : 0,
			},
			{ format: [this.formatName], locale: ru, zero: true },
		);
	}

	setStartDate(date: Date) {
		this.limitDates(date, this.finalDate());
		this.activeMode = '';
	}

	setFinalDate(date: Date) {
		this.limitDates(this.startDate(), date);
		this.activeMode = '';
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
		this.switchFormat(this.activeFormat, startDate, finalDate);
		this.activeMode = mode;
		localStorage.setItem('statMode', mode);
	}

	switchFormat(format: string, startDate = this.startDate(), finalDate = this.finalDate()) {
		switch (format) {
			case 'years':
				this.formatValue = 60 * 24 * 365;
				this.formatName = 'years';
				break;

			case 'months':
				this.formatValue = 60 * 24 * 30;
				this.formatName = 'months';
				break;

			case 'weeks':
				this.formatValue = 60 * 24 * 7;
				this.formatName = 'weeks';
				break;

			case 'days':
				this.formatValue = 60 * 24;
				this.formatName = 'days';
				break;

			case 'hours':
				this.formatValue = 60;
				this.formatName = 'hours';
				break;

			default:
				this.formatValue = 1;
				this.formatName = 'minutes';
				break;
		}

		this.limitDates(startDate, finalDate);
		this.activeFormat = format;
		localStorage.setItem('statFormat', format);
	}
}
