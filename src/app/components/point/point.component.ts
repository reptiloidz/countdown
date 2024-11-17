import {
	Component,
	OnInit,
	OnDestroy,
	HostBinding,
	ChangeDetectionStrategy,
	HostListener,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	Subscription,
	distinctUntilChanged,
	tap,
	mergeMap,
	filter,
	BehaviorSubject,
	of,
} from 'rxjs';
import { Point, UserExtraData } from 'src/app/interfaces';
import {
	DataService,
	AuthService,
	ActionService,
	NotifyService,
} from 'src/app/services';
import {
	addDays,
	addHours,
	addMinutes,
	addMonths,
	addWeeks,
	addYears,
	format,
	formatDate,
	formatDistanceToNow,
	intervalToDuration,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { Constants, DateText, PointColors } from 'src/app/enums';
import {
	getClosestIteration,
	getPointDate,
	parseDate,
	sortDates,
} from 'src/app/helpers';

@Component({
	selector: 'app-point',
	templateUrl: './point.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
})
export class PointComponent implements OnInit, OnDestroy {
	@HostBinding('class') class = 'main__inner';
	@HostListener('window:beforeunload', ['$event'])
	handleBeforeUnload(event: Event) {
		if (this.timerMode) {
			event.preventDefault();
			// @ts-ignore
			event.returnValue = '';
		}
		return '';
	}

	point!: Point | undefined;
	pointDate = new Date();
	remainTextValue = '';
	dateTimer = '';
	timer = '0:00:00';
	loading = false;
	dateLoading = true;
	timerMode = false;
	currentIterationIndex!: number;
	selectedIterationDate = new Date();
	userData!: UserExtraData;
	timerYears: number | string | undefined;
	timerMonths: number | string | undefined;
	timerDays: number | string | undefined;
	timerHours!: number | string;
	timerMins!: number | string;
	timerSecs!: number | string;

	urlMode = new BehaviorSubject<boolean>(false);
	private subscriptions = new Subscription();

	constructor(
		private data: DataService,
		private route: ActivatedRoute,
		private auth: AuthService,
		private action: ActionService,
		private notify: NotifyService
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.route.url.subscribe({
				next: (data: any) => {
					this.urlMode.next(data[0].path === 'url');
				},
			})
		);

		this.subscriptions.add(
			this.route.queryParams
				.pipe(
					distinctUntilChanged(),
					tap((data: any) => {
						if (this.urlModeValue) {
							let dateParsed!: Date;

							if (data.date) {
								dateParsed = parseDate(data.date, true);
							} else {
								this.timerMode = true;

								switch (true) {
									case !!data.years:
										dateParsed = addYears(
											new Date(),
											data.years
										);
										break;
									case !!data.months:
										dateParsed = addMonths(
											new Date(),
											data.months
										);
										break;
									case !!data.weeks:
										dateParsed = addWeeks(
											new Date(),
											data.weeks
										);
										break;
									case !!data.days:
										dateParsed = addDays(
											new Date(),
											data.days
										);
										break;
									case !!data.hours:
										dateParsed = addHours(
											new Date(),
											data.hours
										);
										break;
									case !!data.minutes:
										dateParsed = addMinutes(
											new Date(),
											data.minutes
										);
										break;
								}

								this.notify.add({
									title: 'Событие в режиме "таймера" начнёт отсчёт заново при повторном открытии',
									autoremove: true,
								});
							}

							const fullDate = formatDate(
								dateParsed,
								this.timerMode
									? Constants.reallyFullDateFormat
									: Constants.fullDateFormat
							);

							this.point = {
								color: data.color || 'gray',
								title: data.title || '',
								description: data.description || null,
								dates: [
									{
										date:
											fullDate ||
											formatDate(
												new Date(),
												this.timerMode
													? Constants.reallyFullDateFormat
													: Constants.fullDateFormat
											),
										reason: 'byHand',
									},
								],
								greenwich: false,
								repeatable: false,
								direction:
									fullDate && dateParsed > new Date()
										? 'backward'
										: 'forward',
							};
						}
					}),
					mergeMap(() => this.route.params),
					mergeMap((data: any) => {
						return data['id']
							? this.data.fetchPoint(data['id'])
							: of(undefined);
					}),
					tap((point: Point | undefined) => {
						if (!this.urlModeValue) {
							this.point = point && sortDates(point);
						}
					}),
					mergeMap(() => {
						return this.point?.user && this.auth.isAuthenticated
							? this.auth.getUserData(this.point.user)
							: of(undefined);
					})
				)
				.subscribe({
					next: (userData) => {
						if (!this.urlModeValue && userData) {
							this.userData = userData;
							this.point && this.data.putPoint(this.point);
						}
						this.setAllTimers(true);
						this.dateLoading = false;
						this.point && this.action.pointUpdated(this.point);
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
			this.data.eventEditPoint$.subscribe({
				next: ([point]) => {
					this.loading = this.data.loading = false;
					this.point = point;
					this.action.pointUpdated(this.point);
					this.setAllTimers();
				},
				error: (err) => {
					console.error(
						'Ошибка при обновлении события после сброса таймера:\n',
						err.message
					);
				},
			})
		);
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

	get iterationDate() {
		return format(this.pointDate, Constants.shortDateFormat);
	}

	get iterationReason() {
		return this.point?.dates[this.currentIterationIndex]?.reason;
	}

	get iterationTime() {
		return format(this.pointDate, Constants.timeFormat);
	}

	get isDirectionCorrect() {
		const currentDate = new Date();

		return (
			this.point &&
			((getClosestIteration(this.point).date < currentDate &&
				this.point?.direction === 'forward') ||
				(getClosestIteration(this.point).date > currentDate &&
					this.point?.direction === 'backward'))
		);
	}

	get directionTitle() {
		return `${
			this.point?.direction === 'forward'
				? 'Прямой отсчёт'
				: 'Обратный отсчёт'
		}${
			this.isDirectionCorrect
				? ''
				: '. Но есть нюанс. Подробнее в описании'
		}`;
	}

	get urlModeValue() {
		return this.urlMode.getValue();
	}

	get pointColorNames() {
		return PointColors;
	}

	get pointColorName(): string {
		return (
			(this.point && this.pointColorNames[this.point?.color]) ||
			'Цвет события'
		);
	}

	zeroPad(num?: number) {
		return String(num).padStart(2, '0');
	}

	setAllTimers(switchCalendarDate = false) {
		if (this.dates?.[this.currentIterationIndex] || this.urlModeValue) {
			this.pointDate = getPointDate({
				pointDate: new Date(
					this.dates?.[this.currentIterationIndex || 0].date || ''
				),
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

	iterationSwitchHandler(iterationNumber: number) {
		this.currentIterationIndex = isNaN(iterationNumber)
			? 0
			: iterationNumber;
		this.setAllTimers();
	}
}
