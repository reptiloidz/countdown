import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	OnChanges,
	Output,
	TemplateRef,
} from '@angular/core';
import {
	addDays,
	addHours,
	addMinutes,
	addMonths,
	addYears,
	format,
	isAfter,
	isBefore,
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
import { ru } from 'date-fns/locale';
import { Subscription, concatWith, filter, tap } from 'rxjs';
import { calendarModeNames } from 'src/app/enums';
import { filterIterations, filterPoints } from 'src/app/helpers';
import {
	CalendarDate,
	Iteration,
	Point,
	SwitcherItem,
} from 'src/app/interfaces';
import { ActionService, DataService } from 'src/app/services';
import { CalendarMode } from 'src/app/types';

@Component({
	selector: 'app-calendar',
	templateUrl: './calendar.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnInit, OnDestroy, OnChanges {
	private nowDate = new Date();
	private lastDateOfCurrentMonth!: Date;
	private firstMonday!: Date;
	private subscriptions = new Subscription();
	@Input() activeMode: CalendarMode =
		(localStorage.getItem('calendarMode') as CalendarMode) || 'month';
	@Input() points?: Point[] = [];
	@Input() iterations?: Iteration[] = [];
	@Input() visibleDate = this.nowDate;
	@Input() selectedDate = this.nowDate;
	@Input() point?: Point;
	@Input() hideCurrentPeriod = false;
	@Input() hideModeSwitch = false;
	@Input() daysPerWeek: number | string = 7;
	@Input() weekendDays = [5, 6];
	@Input() rowsNumber!: number;
	@Input() disabledBefore: Date | undefined;
	@Input() disabledAfter: Date | undefined;

	calendarArray: CalendarDate[][] = [];
	daysOfWeek: string[] = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

	@Output() dateSelected = new EventEmitter<{
		date: Date;
		mode: CalendarMode;
		data: Point[] | Iteration[];
	}>();
	@Output() created = new EventEmitter();
	@Output() modeSelected = new EventEmitter<CalendarMode>();
	@Output() visibleDateSelected = new EventEmitter<Date>();

	@ContentChild('navTemplate') navTemplate: TemplateRef<unknown> | undefined;

	constructor(
		private cdr: ChangeDetectorRef,
		private data: DataService,
		private action: ActionService
	) {}

	ngOnInit() {
		this.subscriptions.add(
			this.action.eventIntervalSwitched$
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
						this.generateCalendar();
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

		this.subscriptions.add(
			this.action.eventIterationSwitched$.subscribe({
				next: (date) => {
					this.generateCalendar({ date, selectDate: true });
				},
			})
		);

		this.subscriptions.add(
			this.data.eventRemovePoint$
				.pipe(concatWith(this.action.eventFetchedPoints$))
				.subscribe({
					next: () => {
						this.generateCalendar();
					},
				})
		);

		this.modeSelected.emit(this.activeMode);
		this.generateCalendar();
		this.created.emit();
	}

	ngOnChanges() {
		this.generateCalendar();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get calendarModes(): SwitcherItem[] {
		return Object.keys(calendarModeNames).map((item) => {
			return {
				text: calendarModeNames[item as CalendarMode],
				value: item,
			};
		});
	}

	get visiblePeriod() {
		let result = '';
		switch (this.activeMode) {
			case 'year':
				result = format(this.visibleDate, "yyyy 'г.'", {
					locale: ru,
				});
				break;
			case 'day':
				result = format(this.visibleDate, "yyyy 'г.' / dd MMMM", {
					locale: ru,
				});
				break;
			case 'hour':
				result = format(
					this.visibleDate,
					"yyyy 'г.' / dd MMMM / HH 'ч'",
					{
						locale: ru,
					}
				);
				break;
			default:
				result = format(this.visibleDate, "yyyy 'г.' / LLL", {
					locale: ru,
				});
				break;
		}
		return result;
	}

	get weekDaysArray() {
		let result: string[] = [];
		for (let i = 0; i < +this.daysPerWeek; i++) {
			result.push(this.daysOfWeek[i % 7]);
		}
		return result;
	}

	getItemDate(date: Date) {
		let result = '';
		switch (this.activeMode) {
			case 'day':
				result = format(date, 'k');
				break;
			case 'hour':
				result = format(date, 'm');
				break;
			case 'year':
				result = format(date, 'LLL', {
					locale: ru,
				});
				break;
			default:
				result = format(date, 'd');
				break;
		}
		return result;
	}

	dateClicked({
		date,
		activeMode,
		points,
		iterations,
	}: {
		date: Date;
		activeMode: CalendarMode;
		points: Point[];
		iterations: Iteration[];
	}) {
		let data: Point[] | Iteration[] = [];
		if (points.length) {
			data = points;
		} else if (iterations.length) {
			data = iterations;
		}
		this.selectedDate = date;
		this.dateSelected.emit({ date, mode: activeMode, data });
		// Делаем отложенное срабатывание перерисовки календаря,
		// чтобы кнопка-триггер не исчезла раньше времени и дроп не закрылся
		setTimeout(() => {
			this.generateCalendar();
			this.cdr.detectChanges();
		});
	}

	getStartOfDate(date: Date) {
		let startOfDate: Date;

		switch (this.activeMode) {
			case 'year':
				startOfDate = startOfMonth(date);
				break;
			case 'day':
				startOfDate = startOfHour(date);
				break;
			case 'hour':
				startOfDate = startOfMinute(date);
				break;
			default:
				startOfDate = startOfDay(date);
				break;
		}

		return startOfDate;
	}

	generateCalendar({
		date,
		mode = this.activeMode,
		selectDate = false,
	}: {
		date?: Date;
		mode?: CalendarMode;
		selectDate?: boolean;
	} = {}) {
		date = date || this.visibleDate;
		if (selectDate) {
			this.selectedDate = date;
		}

		this.visibleDate = this.getStartOfDate(date);

		this.visibleDateSelected.emit(this.visibleDate);
		this.lastDateOfCurrentMonth = lastDayOfMonth(date);
		this.firstMonday = isMonday(startOfMonth(date))
			? startOfMonth(date)
			: previousMonday(startOfMonth(date));

		let rows = 1;
		let cols = +this.daysPerWeek;
		let rowNumber = 0;

		if (this.rowsNumber) {
			rows = this.rowsNumber;
		} else {
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

					previousDate = thisDate;

					rowArray.push({
						date: thisDate,
						visibleDate: this.isDateMatch(thisDate, 'visible'),
						selectedDate: this.isDateMatch(thisDate, 'selected'),
						nowDate: this.isDateMatch(thisDate, 'now'),
						disabledDate: this.isDateDisabled(thisDate),
						weekendDate:
							this.weekendDays.includes(i) &&
							this.activeMode === 'month',
						otherMonthDate:
							!isSameMonth(thisDate, this.visibleDate) &&
							this.activeMode === 'month',
						points: filterPoints({
							date: thisDate,
							points: this.points || [],
							activeMode: this.activeMode,
						}),
						iterations: filterIterations({
							date: thisDate,
							iterations: this.iterations || [],
							activeMode: this.activeMode,
							greenwich: this.point?.greenwich || false,
						}),
					});
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

					if (
						(mode === 'month' &&
							!this.rowsNumber &&
							+thisDate === +this.lastDateOfCurrentMonth) ||
						((this.rowsNumber ||
							mode === 'year' ||
							mode === 'day' ||
							mode === 'hour') &&
							rowNumber === rows - 1)
					) {
						loopFinished = true;
					}
					previousDate = thisDate;

					rowArray.push({
						date: thisDate,
						visibleDate: this.isDateMatch(thisDate, 'visible'),
						selectedDate: this.isDateMatch(thisDate, 'selected'),
						nowDate: this.isDateMatch(thisDate, 'now'),
						disabledDate: this.isDateDisabled(thisDate),
						weekendDate:
							this.weekendDays.includes(i) &&
							this.activeMode === 'month',
						otherMonthDate:
							!isSameMonth(thisDate, this.visibleDate) &&
							this.activeMode === 'month',
						points: filterPoints({
							date: thisDate,
							points: this.points || [],
							activeMode: this.activeMode,
						}),
						iterations: filterIterations({
							date: thisDate,
							iterations: this.iterations || [],
							activeMode: this.activeMode,
							greenwich: this.point?.greenwich || false,
						}),
					});
				}
			}

			if (
				mode === 'year' ||
				mode === 'day' ||
				mode === 'hour' ||
				this.rowsNumber
			) {
				rowNumber++;
			}

			fullArray.push(rowArray);
		}
		this.calendarArray = fullArray;
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

	isDateDisabled(date: Date) {
		return (
			(this.disabledAfter &&
				isAfter(date, this.getStartOfDate(this.disabledAfter))) ||
			(this.disabledBefore &&
				isBefore(date, this.getStartOfDate(this.disabledBefore)))
		);
	}

	getAllowedPoints(item: any) {
		// Фильтруем доступные события.
		// Если выводить кнопку попапа, то уже для всех дат с событиями
		return item.points?.filter((point: Point) => !point.public) || [];
	}

	switchCalendarMode(mode: string) {
		this.activeMode = mode as CalendarMode;
		localStorage.setItem('calendarMode', mode);
		this.visibleDate = this.selectedDate;
		this.modeSelected.emit(this.activeMode);
		this.generateCalendar();
	}

	switchCalendarToNow() {
		this.visibleDate = this.nowDate;
		this.generateCalendar();
	}

	switchCalendarToSelected() {
		this.visibleDate = this.selectedDate;
		this.generateCalendar();
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
		this.cdr.detectChanges();
	}
}
