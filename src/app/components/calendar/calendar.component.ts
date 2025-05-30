import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
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
	formatDate,
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
import { calendarModeNames, Constants } from 'src/app/enums';
import { filterIterations, filterPoints, findIterations } from 'src/app/helpers';
import { CalendarDate, Iteration, Point, SwitcherItem } from 'src/app/interfaces';
import { ActionService, DataService } from 'src/app/services';
import { CalendarMode } from 'src/app/types';

@Component({
	selector: 'app-calendar',
	templateUrl: './calendar.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnInit, OnDestroy {
	private nowDate = new Date();
	private lastDateOfCurrentMonth!: Date;
	private firstMonday!: Date;
	private isCalendarInited = false;
	private _visibleDate = this.nowDate;

	private subscriptions = new Subscription();

	@Input() activeMode: CalendarMode = (localStorage.getItem('calendarMode') as CalendarMode) || 'month';
	@Input() points?: Point[] = [];
	@Input() iterations?: Iteration[] = [];
	@Input() selectedDate = this.nowDate;
	@Input() point?: Point;
	@Input() hideCurrentPeriod = false;
	@Input() hideModeSwitch = false;
	@Input() daysPerWeek: number | string = 7;
	@Input() weekendDays = [5, 6];
	@Input() rowsNumber!: number;
	@Input() disabledBefore: Date | undefined;
	@Input() disabledAfter: Date | undefined;
	@Input() staticMode = false;
	@Input() staticCellMode = false;
	@Input() iterationsChecked: boolean[] = [];
	@Input() scrollMoveOff = false;

	/**
	 * При получении значения всегда обновляем календарь, если она обновилась
	 * и записываем новую дату в _visibleDate именно при генерации
	 */
	@Input() get visibleDate(): Date {
		return this._visibleDate;
	}
	set visibleDate(value: Date) {
		this.isCalendarInited &&
			+this._visibleDate !== +value &&
			this.generateCalendar({
				date: value,
			});
	}

	calendarArray: CalendarDate[][] = [];
	daysOfWeek: string[] = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
	tableWrapper?: HTMLElement;
	private isThrottled = false;
	private lastTouchX = 0;
	private lastTouchY = 0;
	private readonly THROTTLE_MS = 250;

	@HostListener('wheel', ['$event'])
	onWheel(event: WheelEvent) {
		const target = event.target as HTMLElement;
		if (
			Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
			this.scrollMoveOff ||
			(target.closest('app-drop') && Array(...target.closest('app-drop')!.classList).includes('calendar__nav--drop'))
		)
			return;
		this.switchCalendarPeriod(event.deltaY > 0);
		event.preventDefault();
	}

	@HostListener('touchstart', ['$event'])
	onTouchStart(event: TouchEvent) {
		const t = event.touches[0];
		this.lastTouchX = t.clientX;
		this.lastTouchY = t.clientY;
	}

	@HostListener('touchmove', ['$event'])
	onTouchMove(event: TouchEvent) {
		const t = event.touches[0];
		const dx = t.clientX - this.lastTouchX;
		const dy = t.clientY - this.lastTouchY;

		if (Math.abs(dx) <= Math.abs(dy)) {
			this.lastTouchX = t.clientX;
			this.lastTouchY = t.clientY;
			return;
		}

		this.switchCalendarPeriod(dx < 0);

		this.lastTouchX = t.clientX;
		this.lastTouchY = t.clientY;
		event.preventDefault();
	}

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
		private action: ActionService,
		private el: ElementRef,
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
					}),
				)
				.subscribe({
					next: () => {
						// Если минута сменилась, перерисовываем календарь насильно
						const prevDateString = formatDate(this.nowDate, Constants.fullDateFormat);
						const nowDateString = formatDate(new Date(), Constants.fullDateFormat);
						this.nowDate = new Date();
						this.generateCalendar({
							force: prevDateString !== nowDateString,
						});
						this.cdr.markForCheck();
					},
				}),
		);

		this.subscriptions.add(
			this.data.eventEditPoint$
				.pipe(
					tap(() => {
						this.cdr.markForCheck();
					}),
				)
				.subscribe(),
		);

		this.subscriptions.add(
			this.action.eventIterationSwitched$.subscribe({
				next: date => {
					this.generateCalendar({ date, selectDate: true });
				},
			}),
		);

		this.subscriptions.add(
			this.data.eventRemovePoint$.pipe(concatWith(this.action.eventFetchedPoints$)).subscribe({
				next: () => {
					this.generateCalendar({
						force: true,
					});
				},
			}),
		);

		this.subscriptions.add(
			this.action.eventIterationsChecked$.subscribe({
				next: () => {
					requestAnimationFrame(() => {
						this.generateCalendar({
							force: true,
						});
						this.cdr.markForCheck();
					});
				},
			}),
		);

		/**
		 * Режим календаря выбран (для родителя),
		 * календарь генерируется с переданной из родителя датой,
		 * родитель уведомляется, флаг об инициализации ставится в true
		 * (чтобы только после этой генерации срабатывала генерация из сеттера visibleDate())
		 */
		this.modeSelected.emit(this.activeMode);
		this.generateCalendar({
			date: this.selectedDate,
		});
		this.created.emit();
		this.isCalendarInited = true;
		this.tableWrapper = this.el.nativeElement.querySelector('.calendar__table-wrapper');
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get calendarModes(): SwitcherItem[] {
		return Object.keys(calendarModeNames).map(item => {
			return {
				text: calendarModeNames[item as CalendarMode],
				value: item,
			};
		});
	}

	get visiblePeriod() {
		let dateFormat = '';
		switch (this.activeMode) {
			case 'year':
				dateFormat = "yyyy 'г.'";
				break;
			case 'day':
				dateFormat = "yyyy 'г.' / dd MMM";
				break;
			case 'hour':
				dateFormat = "yyyy 'г.' / dd MMM / HH 'ч'";
				break;
			default:
				dateFormat = "yyyy 'г.' / LLL";
				break;
		}
		return format(this.visibleDate, dateFormat, {
			locale: ru,
		});
	}

	get weekDaysArray() {
		let result: string[] = [];
		for (let i = 0; i < +this.daysPerWeek; i++) {
			result.push(this.daysOfWeek[i % 7]);
		}
		return result;
	}

	trackBy(index: number): number {
		return index;
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
		if (this.staticMode || (this.staticCellMode && !points.length && !iterations.length)) return;

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
			this.generateCalendar({
				date,
			});
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
		force = false,
	}: {
		date?: Date;
		mode?: CalendarMode;
		selectDate?: boolean;
		force?: boolean;
	} = {}) {
		date = date || this.visibleDate;

		/**
		 * Делаем проверку, что есть изменения в режиме/выбранной дате,
		 * чтобы не делать лишних перегенераций календаря
		 */
		if (
			mode === this.activeMode &&
			this._visibleDate === date &&
			((this.selectedDate === date && selectDate) || !selectDate) &&
			this.calendarArray.length &&
			!force
		)
			return;

		if (selectDate) {
			this.selectedDate = date;
		}

		this.activeMode = mode;

		/**
		 * Записываем _visibleDate напрямую, чтобы не вызывать лишних действий через геттер
		 */
		this._visibleDate = this.getStartOfDate(date);

		this.visibleDateSelected.emit(this.visibleDate);
		this.lastDateOfCurrentMonth = lastDayOfMonth(date);
		this.firstMonday = isMonday(startOfMonth(date)) ? startOfMonth(date) : previousMonday(startOfMonth(date));

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
						weekendDate: this.weekendDays.includes(i) && this.activeMode === 'month',
						otherMonthDate: !isSameMonth(thisDate, this.visibleDate) && this.activeMode === 'month',
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
						itemsChecked: this.filterChecked(thisDate),
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
						(mode === 'month' && !this.rowsNumber && +thisDate === +this.lastDateOfCurrentMonth) ||
						((this.rowsNumber || mode === 'year' || mode === 'day' || mode === 'hour') && rowNumber === rows - 1)
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
						weekendDate: this.weekendDays.includes(i) && this.activeMode === 'month',
						otherMonthDate: !isSameMonth(thisDate, this.visibleDate) && this.activeMode === 'month',
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
						itemsChecked: this.filterChecked(thisDate),
					});
				}
			}

			if (mode === 'year' || mode === 'day' || mode === 'hour' || this.rowsNumber) {
				rowNumber++;
			}

			fullArray.push(rowArray);
		}
		this.calendarArray = fullArray;
	}

	filterChecked(date: Date) {
		if (this.iterations?.length) {
			return this.iterations.filter(
				(iteration, index) =>
					findIterations({
						iteration,
						date,
						activeMode: this.activeMode,
						greenwich: !!this.point?.greenwich,
					}) && this.iterationsChecked[index],
			).length;
		} else if (this.points?.length) {
			return this.points.filter(item => {
				return (
					item.id &&
					this.action.checkedPoints.includes(item.id) &&
					item.dates.some(iteration =>
						findIterations({
							iteration,
							date,
							activeMode: this.activeMode,
							greenwich: item.greenwich,
						}),
					)
				);
			}).length;
		} else {
			return 0;
		}
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
			(this.disabledAfter && isAfter(date, this.getStartOfDate(this.disabledAfter))) ||
			(this.disabledBefore && isBefore(date, this.getStartOfDate(this.disabledBefore)))
		);
	}

	switchCalendarMode(mode: string) {
		this.generateCalendar({
			date: this.selectedDate,
			mode: mode as CalendarMode,
		});
		localStorage.setItem('calendarMode', mode);
		this.modeSelected.emit(this.activeMode);
	}

	switchCalendarToNow() {
		this.blinkCalendar();
		this.generateCalendar({
			date: this.nowDate,
		});
	}

	switchCalendarToSelected() {
		this.blinkCalendar();
		this.generateCalendar({
			date: this.selectedDate,
		});
	}

	blinkCalendar() {
		this.tableWrapper?.classList.add('calendar__table-wrapper--blink');
		setTimeout(() => {
			this.tableWrapper?.classList.remove('calendar__table-wrapper--blink');
		}, this.THROTTLE_MS);
	}

	switchCalendarPeriod(forward = true) {
		if (this.isThrottled) {
			return;
		}
		this.isThrottled = true;
		setTimeout(() => (this.isThrottled = false), this.THROTTLE_MS);

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

		const animateClass = `calendar__table-wrapper--animate-${forward ? 'right' : 'left'}`;

		this.tableWrapper?.classList.add(animateClass);

		setTimeout(() => {
			this.tableWrapper?.classList.remove(animateClass);
		}, this.THROTTLE_MS);

		this.generateCalendar({
			date: result[this.activeMode][forward ? 'forward' : 'backward'],
		});
		this.cdr.markForCheck();
	}
}
