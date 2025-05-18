import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Input,
	OnInit,
	signal,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { differenceInMinutes, Duration, endOfYear, formatDuration, startOfYear, subYears } from 'date-fns';
import { ru } from 'date-fns/locale';
import { minutesInDay, minutesInHour, minutesInMonth, minutesInYear } from 'date-fns/constants';
import { parseDate, sortDates } from 'src/app/helpers';
import { Iteration, Point, SwitcherItem } from 'src/app/interfaces';
import { DifferenceMode } from 'src/app/types';

@Component({
	selector: 'app-mode-stats',
	templateUrl: './mode-stats.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeStatsComponent implements OnInit, AfterViewInit {
	@Input() point!: Point;
	@HostBinding('class') class = 'mode-stats';
	@ViewChild('formatsRef', { read: ViewContainerRef })
	formatsRef: ViewContainerRef | undefined;

	dates = signal<Iteration[]>([]);
	modeSumFirst = 0;
	modeSumSecond = 0;
	modeSumFirstFormatted = signal('');
	modeSumSecondFormatted = signal('');
	changes = signal(0);
	sum = signal('');
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

	formatList: {
		text: string;
		value: DifferenceMode;
		checked: boolean;
		disabled: boolean;
	}[] = [
		{
			text: 'Годы',
			value: 'years',
			checked: false,
			disabled: false,
		},
		{
			text: 'Месяцы',
			value: 'months',
			checked: false,
			disabled: false,
		},
		{
			text: 'Недели',
			value: 'weeks',
			checked: false,
			disabled: false,
		},
		{
			text: 'Дни',
			value: 'days',
			checked: false,
			disabled: false,
		},
		{
			text: 'Часы',
			value: 'hours',
			checked: false,
			disabled: false,
		},
		{
			text: 'Минуты',
			value: 'minutes',
			checked: false,
			disabled: false,
		},
	];
	activeFormat = localStorage.getItem('statFormat') ?? 'minutes';
	formatNames: DifferenceMode[] = this.activeFormat.split('_') as DifferenceMode[];

	ngOnInit(): void {
		this.dates.set(sortDates(this.point).dates);

		this.firstIterationDate.set(parseDate(this.dates()[0].date));
		this.lastIterationDate.set(parseDate(this.dates()[this.dates().length - 1].date));
	}

	ngAfterViewInit(): void {
		this.switchMode(this.activeMode);
	}

	get now() {
		return new Date();
	}

	reset() {
		this.isStartIteration = true;
		this.modeSumFirst = 0;
		this.modeSumSecond = 0;
		this.changes.set(0);
		this.sum.set('');
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
		let changes = 0;

		for (let iteration of this.dates()) {
			nextItem++;
			let currentDate = parseDate(iteration.date);
			const isNextDateAfterFirst = +parseDate(this.dates()[nextItem]?.date) > +firstDate;
			const isPrevAndCurrentModeSame =
				this.dates()[nextItem - 2]?.mode?.name === this.dates()[nextItem - 1].mode?.name &&
				this.dates()[nextItem - 2]?.mode?.icon === this.dates()[nextItem - 1].mode?.icon;

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
			if (((!isPrevAndCurrentModeSame && difference) || this.isFutureNow) && isNextDateAfterFirst) {
				if (this.isFirstMode(this.dates()[nextItem - 1])) {
					this.modeSumFirst += difference;
					if (this.isFutureNow) {
						this.modeSumSecond += differenceInMinutes(lastDate, currentDate);
					}
				} else {
					this.modeSumSecond += difference;
					if (this.isFutureNow) {
						this.modeSumFirst += differenceInMinutes(lastDate, currentDate);
					}
				}
				changes += 1;
			}

			previousDate = currentDate;

			this.isStartIteration && (this.isStartIteration = false);
			if (this.isFinalIteration) {
				if (!isPrevAndCurrentModeSame && difference) {
					changes += 1;
				}
				this.isFinalIteration = false;
				this.modeSumFirstFormatted.set(this.formatDate(this.modeSumFirst));
				this.modeSumSecondFormatted.set(this.formatDate(this.modeSumSecond));
				this.changes.set(changes);
				this.sum.set(this.formatDate(this.modeSumFirst + this.modeSumSecond));
				return;
			}
		}
	}

	formatDate(minutes: number) {
		let result: Duration = {};

		this.formatList.forEach(item => {
			let k = 1;
			switch (item.value) {
				case 'years':
					k = minutesInYear;
					break;
				case 'months':
					k = minutesInMonth;
					break;
				case 'weeks':
					k = minutesInDay * 7;
					break;
				case 'days':
					k = minutesInDay;
					break;
				case 'hours':
					k = minutesInHour;
					break;
				default:
					break;
			}

			if (this.formatNames.includes(item.value)) {
				const currentResult = Math.floor(minutes / k);
				result[item.value] = currentResult;
				minutes -= currentResult * k;
			}
		});

		return formatDuration(result, { format: this.formatNames, locale: ru, zero: true });
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
		this.switchFormat(false, startDate, finalDate);
		this.activeMode = mode;
		localStorage.setItem('statMode', mode);
	}

	switchFormat(setToLS = false, startDate = this.startDate(), finalDate = this.finalDate()) {
		if (setToLS) {
			this.formatNames = this.formatsRef
				? Array(...this.formatsRef.element.nativeElement.querySelectorAll('input:checked')).map(item => item.name)
				: [];
			this.activeFormat = this.formatNames.join('_');
			localStorage.setItem('statFormat', this.activeFormat);
		} else {
			this.formatList.forEach(item => {
				item.checked = this.activeFormat.includes(item.value);
				item.disabled = false;
			});
		}
		this.formatList
			.filter(item => this.formatNames.includes(item.value))
			.forEach(item => {
				const checkbox = this.formatsRef?.element.nativeElement?.querySelector(
					`[name='${item.value}']`,
				) as HTMLInputElement;
				if (checkbox) {
					checkbox.disabled = this.formatNames.length === 1;
				}
			});
		this.limitDates(startDate, finalDate);
	}
}
