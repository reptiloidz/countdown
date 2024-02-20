import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
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
	isSameDay,
	isSameHour,
	isSameMinute,
	isSameMonth,
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
import { Subscription, filter, interval, tap } from 'rxjs';
import { filterIterations, filterPoints } from 'src/app/helpers';
import {
	CalendarDate,
	CalendarMode,
	Iteration,
	Point,
} from 'src/app/interfaces';
import { DataService } from 'src/app/services';

@Component({
	selector: 'app-calendar',
	templateUrl: './calendar.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnInit, OnDestroy {
	private nowDate = new Date();
	private lastDateOfCurrentMonth!: Date;
	private firstMonday!: Date;
	private subscriptions = new Subscription();
	activeMode: CalendarMode = 'month';

	@Input() points?: Point[] = [];
	@Input() iterations?: Iteration[] = [];
	@Input() visibleDate = this.nowDate;
	@Input() selectedDate = this.nowDate;

	@Output() dateSelected = new EventEmitter<{
		date: Date;
		mode: CalendarMode;
		data: Point[] | Iteration[];
	}>();

	@Output() modeSelected = new EventEmitter<CalendarMode>();

	constructor(private cdr: ChangeDetectorRef, private data: DataService) {}

	ngOnInit() {
		this.subscriptions.add(
			interval(1000)
				.pipe(
					filter(() => {
						switch (this.activeMode) {
							case 'year':
								return !isSameMonth(this.nowDate, new Date());
							case 'day':
								return !isSameHour(this.nowDate, new Date());
							case 'hour':
								return !isSameMinute(this.nowDate, new Date());
							default:
								return !isSameDay(this.nowDate, new Date());
						}
					})
				)
				.subscribe({
					next: () => {
						this.nowDate = new Date();
						this.cdr.detectChanges();
					},
				})
		);

		this.subscriptions.add(
			this.data.eventEditPoint$
				.pipe(
					tap(() => {
						this.cdr.detectChanges();
					})
				)
				.subscribe()
		);

		this.modeSelected.emit(this.activeMode);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	dateClicked(
		date: Date,
		activeMode: CalendarMode,
		points: Point[],
		iterations: Iteration[]
	) {
		let data: Point[] | Iteration[] = [];
		if (points.length) {
			data = points;
		} else if (iterations.length) {
			data = iterations;
		}
		this.selectedDate = date;
		this.dateSelected.emit({ date, mode: activeMode, data });
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
						points: filterPoints(
							thisDate,
							this.points || [],
							this.activeMode
						),
						iterations: filterIterations(
							thisDate,
							this.iterations || [],
							this.activeMode
						),
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
						points: filterPoints(
							thisDate,
							this.points || [],
							this.activeMode
						),
						iterations: filterIterations(
							thisDate,
							this.iterations || [],
							this.activeMode
						),
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
		this.modeSelected.emit(this.activeMode);
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
