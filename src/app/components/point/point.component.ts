import {
	Component,
	OnInit,
	OnDestroy,
	ViewChild,
	ElementRef,
	HostBinding,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
	Subscription,
	distinctUntilChanged,
	tap,
	mergeMap,
	filter,
	fromEvent,
	timer,
	throttle,
} from 'rxjs';
import { Point, Iteration, UserExtraData } from 'src/app/interfaces';
import { DataService, AuthService, ActionService } from 'src/app/services';
import { format, formatDistanceToNow, intervalToDuration } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Constants, DateText } from 'src/app/enums';
import {
	filterIterations,
	getClosestIteration,
	getFirstIteration,
	getPointDate,
	parseDate,
	sortDates,
} from 'src/app/helpers';
import { CalendarMode } from 'src/app/types';
import { PanelComponent } from '../panel/panel.component';

@Component({
	selector: 'app-point',
	templateUrl: './point.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
})
export class PointComponent implements OnInit, OnDestroy {
	@ViewChild('iterationsList') private iterationsList!: ElementRef;
	@ViewChild('panelCalendar') private panelCalendar!: PanelComponent;
	@HostBinding('class') class = 'main__inner';
	point!: Point | undefined;
	pointDate = new Date();
	remainTextValue = '';
	dateTimer = '';
	timer = '0:00:00';
	loading = false;
	dateLoading = true;
	hasAccess: boolean | undefined = false;
	tzOffset = this.pointDate.getTimezoneOffset();
	currentIterationIndex!: number;
	firstIterationIndex = 0;
	removedIterationIndex = 0;
	iterationsChecked: Number[] = [];
	selectedIterationDate = new Date();
	selectedIterationsNumber = 0;
	calendarMode!: CalendarMode;
	userData!: UserExtraData;
	isCalendarPanelOpen = false;
	isCalendarCreated = false;
	timerYears: number | string | undefined;
	timerMonths: number | string | undefined;
	timerDays: number | string | undefined;
	timerHours!: number | string;
	timerMins!: number | string;
	timerSecs!: number | string;

	private subscriptions = new Subscription();

	constructor(
		private data: DataService,
		private router: Router,
		private route: ActivatedRoute,
		private auth: AuthService,
		private action: ActionService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.route.queryParams
				.pipe(
					distinctUntilChanged(),
					tap((data: any) => {
						data.iteration &&
							(this.currentIterationIndex = data.iteration - 1);
					}),
					mergeMap(() => this.route.params),
					mergeMap((data: any) => {
						return this.data.fetchPoint(data['id']);
					}),
					tap((point: Point | undefined) => {
						this.point = point && sortDates(point);

						this.hasAccess =
							this.hasAccess ||
							(point && this.auth.checkAccessEdit(point));

						if (this.dates?.length) {
							if (
								this.currentIterationIndex >
									this.dates.length ||
								typeof this.currentIterationIndex !==
									'number' ||
								isNaN(this.currentIterationIndex) ||
								this.currentIterationIndex < 0
							) {
								point &&
									this.switchIteration(
										getClosestIteration(point).index
									);
							}
						} else {
							this.switchIteration();
						}

						requestAnimationFrame(() => {
							(this.iterationsList?.nativeElement as HTMLElement)
								?.querySelector('.tabs__item--active input')
								?.scrollIntoView({
									block: 'nearest',
									behavior: 'smooth',
								});
						});
					}),
					mergeMap(() => this.auth.getUserData(this.point?.user))
				)
				.subscribe({
					next: (userData) => {
						this.userData = userData;
						this.point && this.data.putPoint(this.point);
						this.setAllTimers(true);
						this.dateLoading = false;
						this.setIterationsParam();
						this.action.iterationSwitched(this.pointDate);
					},
					error: (err) => {
						console.error(
							'Ошибка при обновлении таймеров:\n',
							err.message
						);
					},
				})
		);

		this.subscriptions.add(
			fromEvent(document, 'wheel')
				.pipe(
					filter((event) => {
						const eWheel = event as WheelEvent;
						return this.iterationsList.nativeElement.contains(
							eWheel.target as HTMLElement
						);
					}),
					throttle(() => timer(100))
				)
				.subscribe({
					next: (event) => {
						const eWheel = event as WheelEvent;
						if (eWheel.deltaY !== 0) {
							if (this.iterationsList.nativeElement) {
								this.iterationsList.nativeElement.scrollLeft +=
									eWheel.deltaY;
							}
						}
					},
				})
		);

		this.subscriptions.add(
			this.action.eventIntervalSwitched$
				.pipe(
					filter(() => {
						return !this.dateLoading;
					})
				)
				.subscribe({
					next: () => {
						this.setAllTimers();
					},
					error: (err) => {
						console.error(
							'Ошибка при обновлении таймеров:\n',
							err.message
						);
					},
				})
		);

		this.subscriptions.add(
			this.data.eventStartEditPoint$.subscribe({
				next: () => {
					this.loading = true;
				},
				error: (err) => {
					console.error('Ошибка при сбросе таймера:\n', err.message);
				},
			})
		);

		this.subscriptions.add(
			this.data.eventEditPoint$.subscribe({
				next: ([point]) => {
					this.loading = this.data.loading = false;
					this.point = point;
					if (
						this.currentIterationIndex >= this.removedIterationIndex
					) {
						this.currentIterationIndex = point.dates.length - 1;
					}
					this.switchIteration();
					this.setAllTimers();
					this.setIterationsParam();
				},
				error: (err) => {
					console.error(
						'Ошибка при обновлении события после сброса таймера:\n',
						err.message
					);
				},
			})
		);

		this.switchCalendarPanel();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get interval() {
		return intervalToDuration({
			start: this.pointDate,
			end: new Date(),
		});
	}

	get remainText() {
		const isPast = this.pointDate < new Date();
		const isForward = this.point?.direction === 'forward';

		return isPast
			? isForward
				? DateText.forwardPast
				: DateText.backwardPast
			: isForward
			? DateText.forwardFuture
			: DateText.backwardFuture;
	}

	get dates() {
		return this.point?.dates;
	}

	get datesBefore() {
		return this.dates?.filter((item) => parseDate(item.date) < new Date());
	}

	get datesAfter() {
		return this.dates?.filter((item) => parseDate(item.date) > new Date());
	}

	get iterationDate() {
		return format(this.pointDate, Constants.shortDateFormat);
	}

	get iterationTime() {
		return format(this.pointDate, Constants.timeFormat);
	}

	get isDatesLengthPlural() {
		return this.dates && this.dates?.length > 1;
	}

	get calendarOpen() {
		return this.isCalendarCreated && this.isCalendarPanelOpen;
	}

	onIterationsScroll(event: WheelEvent) {
		event.preventDefault();
	}

	switchCalendarPanel(value?: boolean) {
		if (typeof value !== 'undefined') {
			this.isCalendarPanelOpen = value;
			localStorage.setItem('isCalendarPanelOpen', value.toString());
		} else {
			this.isCalendarPanelOpen =
				localStorage.getItem('isCalendarPanelOpen') === 'true'
					? true
					: false;
		}
	}

	setIterationsParam() {
		const filteredIterations = filterIterations({
			date: this.pointDate,
			iterations: this.point?.dates || [],
			activeMode: this.calendarMode,
			greenwich: this.point?.greenwich || false,
		});
		this.firstIterationIndex =
			getFirstIteration(filteredIterations, this.point) || 0;
		this.selectedIterationsNumber = filteredIterations.length;
	}

	zeroPad(num?: number) {
		return String(num).padStart(2, '0');
	}

	setAllTimers(switchCalendarDate = false) {
		if (this.dates?.[this.currentIterationIndex]) {
			this.pointDate = getPointDate({
				pointDate: new Date(
					this.dates?.[this.currentIterationIndex].date || ''
				),
				tzOffset: this.tzOffset,
				isGreenwich: this.point?.greenwich,
			});
		}

		if (switchCalendarDate) {
			this.selectedIterationDate = this.pointDate;
		} else {
			this.setTimer();
		}
	}

	setTimer() {
		const currentInterval = this.interval;

		this.timerHours = this.zeroPad(
			(currentInterval.hours && Math.abs(currentInterval.hours)) || 0
		);

		this.timerMins = this.zeroPad(
			(currentInterval.minutes && Math.abs(currentInterval.minutes)) || 0
		);
		this.timerSecs = this.zeroPad(
			(currentInterval.seconds && Math.abs(currentInterval.seconds)) || 0
		);

		this.timerYears = currentInterval.years
			? this.zeroPad(Math.abs(currentInterval.years))
			: undefined;
		this.timerMonths = currentInterval.months
			? this.zeroPad(Math.abs(currentInterval.months))
			: undefined;
		this.timerDays = currentInterval.days
			? this.zeroPad(Math.abs(currentInterval.days))
			: undefined;

		this.remainTextValue =
			this.remainText +
			': ' +
			formatDistanceToNow(this.pointDate, {
				locale: ru,
			});
	}

	switchIteration(i: number = this.currentIterationIndex) {
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				iteration: i + 1,
			},
			queryParamsHandling: 'merge',
		});
	}

	removeIteration(i: number) {
		let newDatesArray = this.dates?.slice(0);
		newDatesArray && newDatesArray.splice(i, 1);

		confirm('Удалить итерацию?') &&
			(() => {
				this.removedIterationIndex = i;
				this.data.editPoint(this.point?.id, {
					...this.point,
					dates: newDatesArray,
				} as Point);
			})();
	}

	checkIteration() {
		this.iterationsChecked = Array.from(
			this.iterationsList.nativeElement.children
		)
			.filter((item: any) => item.querySelector('input')?.checked)
			.map((item: any) => item.querySelector('input')?.name);
	}

	checkAllIterations(check = true, iterations?: Iteration[]) {
		[...this.iterationsList.nativeElement.querySelectorAll('input')]
			.filter((item: HTMLInputElement) => {
				if (!iterations?.length) {
					return true;
				} else {
					return iterations.some(
						(iteration) =>
							iteration.date ===
							this.point?.dates[
								parseFloat(item.getAttribute('name') || '0')
							].date
					);
				}
			})
			.forEach((item: any) => {
				item.checked = check;
			});
		this.checkIteration();
	}

	removeCheckedIterations() {
		let newDatesArray = this.dates?.slice(0);
		newDatesArray = newDatesArray?.filter(
			(item, i: any) => !this.iterationsChecked.includes(i.toString())
		);

		confirm(
			'Удалить выбранные итерации? Если выбраны все, останется только последняя'
		) &&
			(() => {
				this.data.editPoint(this.point?.id, {
					...this.point,
					dates: newDatesArray?.length
						? newDatesArray
						: [this.dates?.[this.dates?.length - 1]],
				} as Point);
			})();
	}

	dateSelected({ data }: { data: Point[] | Iteration[] }) {
		const iterationIndex = getFirstIteration(
			data as Iteration[],
			this.point
		);
		if ((iterationIndex || iterationIndex === 0) && iterationIndex >= 0) {
			this.switchIteration(iterationIndex);
		}
	}

	modeSelected(mode: CalendarMode) {
		this.calendarMode = mode;
		this.setIterationsParam();

		if (this.panelCalendar) {
			this.panelCalendar.updateHeight();
		} else {
			requestAnimationFrame(() => {
				this.panelCalendar?.updateHeight();
			});
		}
	}

	dateChecked({
		data,
		check,
	}: {
		data: Point[] | Iteration[];
		check: boolean;
	}) {
		if (check) {
			this.checkAllIterations(true, data as Iteration[]);
		} else {
			this.checkAllIterations(false, data as Iteration[]);
		}
	}

	calendarCreated() {
		this.isCalendarCreated = true;
		this.cdr.detectChanges();
	}
}
