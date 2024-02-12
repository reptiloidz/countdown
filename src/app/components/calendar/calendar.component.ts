import {
	Component,
	EventEmitter,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core';
import {
	addDays,
	addHours,
	addMinutes,
	addMonths,
	addYears,
	isMonday,
	lastDayOfMonth,
	previousMonday,
	startOfDay,
	startOfHour,
	startOfMinute,
	startOfMonth,
	startOfYear,
	subDays,
	subHours,
	subMonths,
	subYears,
} from 'date-fns';
import { Subscription, interval } from 'rxjs';
import { CalendarDate } from 'src/app/interfaces/calendarDate.interface';
import { CalendarMode } from 'src/app/interfaces/calendarMode.type';

@Component({
	selector: 'app-calendar',
	templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit, OnDestroy {
	private nowDate = new Date();
	private selectedDate = this.nowDate;
	private visibleDate = this.nowDate;
	private lastDateOfCurrentMonth!: Date;
	private firstMonday!: Date;
	private subscriptions = new Subscription();
	activeMode: CalendarMode = 'month';

	@Output() dateSelected = new EventEmitter<{
		date: Date;
		mode: CalendarMode;
	}>();

	ngOnInit() {
		this.subscriptions.add(
			interval(10000).subscribe({
				next: () => {
					this.nowDate = new Date();
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	dateClicked(date: Date, activeMode: CalendarMode) {
		this.selectedDate = date;
		this.visibleDate = date;
		this.dateSelected.emit({ date, mode: activeMode });
	}

	generateCalendar({
		date = this.visibleDate,
		mode = this.activeMode,
	}: {
		date?: Date;
		mode?: CalendarMode;
	} = {}) {
		switch (this.activeMode) {
			case 'year':
				this.visibleDate = startOfMonth(date);
				break;
			case 'day':
				this.visibleDate = startOfHour(date);
				break;
			case 'hour':
				this.visibleDate = startOfMinute(date);
				break;
			default:
				this.visibleDate = startOfDay(date);
				break;
		}
		this.lastDateOfCurrentMonth = lastDayOfMonth(date);
		this.firstMonday = isMonday(startOfMonth(date))
			? startOfMonth(date)
			: previousMonday(startOfMonth(date));

		let rows = 1;
		let cols = 7;
		let rowNumber = 0;

		switch (mode) {
			case 'year':
				cols = 12;
				break;
			case 'day':
				rows = 2;
				cols = 12;
				break;
			case 'hour':
				rows = 4;
				cols = 15;
				break;
			default:
				break;
		}

		let fullArray = [];
		let loopFinished = false;
		let previousDate!: Date;

		while (!loopFinished) {
			let rowArray: CalendarDate[] = [];

			for (let i = 0; i < cols; i++) {
				if (!previousDate) {
					let thisDate = this.firstMonday;

					switch (this.activeMode) {
						case 'year':
							thisDate = startOfYear(this.visibleDate);
							break;
						case 'day':
							thisDate = startOfDay(this.visibleDate);
							break;
						case 'hour':
							thisDate = startOfHour(this.visibleDate);
							break;
						default:
							break;
					}

					rowArray.push({
						date: thisDate,
						visibleDate: this.isDateMatch(thisDate, 'visible'),
						selectedDate: this.isDateMatch(thisDate, 'selected'),
						nowDate: this.isDateMatch(thisDate, 'now'),
					});
					previousDate = thisDate;
				} else {
					let thisDate = addDays(previousDate, 1);

					switch (this.activeMode) {
						case 'year':
							thisDate = addMonths(previousDate, 1);
							break;
						case 'day':
							thisDate = addHours(previousDate, 1);
							break;
						case 'hour':
							thisDate = addMinutes(previousDate, 1);
							break;
						default:
							break;
					}

					rowArray.push({
						date: thisDate,
						visibleDate: this.isDateMatch(thisDate, 'visible'),
						selectedDate: this.isDateMatch(thisDate, 'selected'),
						nowDate: this.isDateMatch(thisDate, 'now'),
					});
					previousDate = thisDate;

					if (
						(mode === 'month' &&
							+thisDate === +this.lastDateOfCurrentMonth) ||
						((mode === 'year' ||
							mode === 'day' ||
							mode === 'hour') &&
							rowNumber === rows - 1)
					) {
						loopFinished = true;
					}
				}
			}

			if (mode === 'year' || mode === 'day' || mode === 'hour') {
				rowNumber++;
			}

			fullArray.push(rowArray);
		}

		return fullArray;
	}

	isDateMatch(date: Date, matchMode: 'visible' | 'selected' | 'now') {
		switch (this.activeMode) {
			case 'year':
				return +date === +startOfMonth(this[`${matchMode}Date`]);
			case 'day':
				return +date === +startOfHour(this[`${matchMode}Date`]);
			case 'hour':
				return +date === +startOfMinute(this[`${matchMode}Date`]);
			default:
				return +date === +startOfDay(this[`${matchMode}Date`]);
		}
	}

	switchCalendarMode(mode: CalendarMode) {
		this.activeMode = mode;
	}

	switchCalendarToNow() {
		this.visibleDate = this.nowDate;
	}

	switchCalendarPeriod(forward = true) {
		const result = {
			year: {
				forward: addYears(this.visibleDate, 1),
				backward: subYears(this.visibleDate, 1),
			},
			month: {
				forward: addMonths(this.visibleDate, 1),
				backward: subMonths(this.visibleDate, 1),
			},
			day: {
				forward: addDays(this.visibleDate, 1),
				backward: subDays(this.visibleDate, 1),
			},
			hour: {
				forward: addHours(this.visibleDate, 1),
				backward: subHours(this.visibleDate, 1),
			},
		};

		this.generateCalendar({
			date: result[this.activeMode][forward ? 'forward' : 'backward'],
		});
	}
}
