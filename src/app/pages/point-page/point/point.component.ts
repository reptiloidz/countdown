import {
	Component,
	OnInit,
	OnDestroy,
	HostBinding,
	ChangeDetectionStrategy,
	HostListener,
	ViewChild,
	ElementRef,
	signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, distinctUntilChanged, tap, mergeMap, filter, BehaviorSubject, of, interval, take } from 'rxjs';
import { Point, UserExtraData } from 'src/app/interfaces';
import { DataService, AuthService, ActionService, NotifyService, PopupService } from 'src/app/services';
import { format, formatDate, formatDistance, formatDistanceToNow, intervalToDuration } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Constants, DateText, PointColors } from 'src/app/enums';
import {
	getClosestIteration,
	getPointDate,
	getPointFromUrl,
	parseDate,
	setIterationsMode,
	sortDates,
} from 'src/app/helpers';
import { Title } from '@angular/platform-browser';
import { CheckboxComponent } from '../../../components/checkbox/checkbox.component';
import { ModeStatsComponent } from 'src/app/components/mode-stats/mode-stats.component';
import { DateType, TimeType } from 'src/app/types';

@Component({
	selector: 'app-point',
	templateUrl: './point.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
})
export class PointComponent implements OnInit, OnDestroy {
	@HostBinding('class') class = 'main__inner';
	@HostListener('window:beforeunload', ['$event'])
	handleBeforeUnload(event: Event) {
		console.log('this.timerMode', this.timerMode);

		if (this.timerMode) {
			event.preventDefault();
			// @ts-ignore
			event.returnValue = '';
		}
		return '';
	}
	@ViewChild('audioFinish')
	audioFinish!: ElementRef<HTMLAudioElement>;
	@ViewChild('soundCheckbox')
	soundCheckbox!: CheckboxComponent;

	point!: Point | undefined;
	pointDate = new Date();
	initialDate = new Date();
	dateTimer = '';
	timer = '0:00:00';
	loading = false;
	dateLoading = true;
	timerMode = false;
	currentIterationIndex!: number;
	selectedIterationDate = new Date();
	userData!: UserExtraData;
	timerYears: DateType;
	timerMonths: DateType;
	timerDays: DateType;
	timerHours!: TimeType;
	timerMins!: TimeType;
	timerSecs!: TimeType;
	timerPercent = signal(0);
	pausedTime: Date | undefined;
	sound = false;
	timerNotifyText = 'Событие в&nbsp;режиме &laquo;таймера&raquo; начнёт отсчёт заново при повторном открытии';
	soundNotify: Date | undefined;
	inverted = false;
	finalTitleCount = 0;
	isDirectionCorrect = false;

	private _closestIterationDate: Date | undefined;

	urlMode = new BehaviorSubject<boolean>(false);
	private subscriptions = new Subscription();
	private moveTimelineSubscription = new Subscription();

	constructor(
		private data: DataService,
		private route: ActivatedRoute,
		private auth: AuthService,
		private action: ActionService,
		private notify: NotifyService,
		private title: Title,
		private popupService: PopupService,
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.route.pathFromRoot?.[1].url.subscribe({
				next: (data: any) => {
					this.urlMode.next(data[0]?.path === 'url');
				},
			}),
		);

		this.subscriptions.add(
			this.route.queryParams
				.pipe(
					distinctUntilChanged(),
					tap((data: any) => {
						if (this.urlModeValue) {
							this.point = getPointFromUrl(data);

							if (!data.date) {
								this.timerMode = true;
								if (this.localStorageSound === 'disabled') {
									this.notify.add({
										title: this.timerNotifyText,
										autoremove: true,
									});
								} else {
									this.soundNotify = new Date();
									this.notify
										.confirm(
											{
												title: `
												${this.timerNotifyText}.
												Воспроизвести звуковой сигнал в&nbsp;конце?
											`,
												button: 'Да',
											},
											this.soundNotify,
										)
										.subscribe({
											next: () => {
												this.sound = true;
											},
										});
								}
							}
						}
					}),
					mergeMap(() => this.route.params),
					mergeMap((data: any) => {
						return data['id'] ? this.data.fetchPoint(data['id']) : of(undefined);
					}),
					tap((point: Point | undefined) => {
						if (!this.urlModeValue) {
							this.point = point && setIterationsMode(sortDates(point));
						}
					}),
					mergeMap(() => {
						return this.point?.user && this.auth.isAuthenticated
							? this.auth.getUserData(this.point.user)
							: of(undefined);
					}),
				)
				.subscribe({
					next: userData => {
						if (!this.urlModeValue && userData) {
							this.userData = userData;
							this.point && this.data.putPoint(this.point);
						}
						this.dateLoading = false;
						this.setAllTimers(true);
						this.point && this.action.pointUpdated(this.point);
					},
					error: err => {
						this.dateLoading = false;
						console.error('Ошибка при обновлении таймеров:\n', err.message);
					},
				}),
		);

		this.subscriptions.add(
			this.action.eventIntervalSwitched$
				.pipe(
					filter(() => {
						return !this.dateLoading && !this.pausedTime;
					}),
				)
				.subscribe({
					next: () => {
						this.setAllTimers();
					},
					error: err => {
						console.error('Ошибка при обновлении таймеров:\n', err.message);
					},
				}),
		);

		this.subscriptions.add(
			this.data.eventEditPoint$.subscribe({
				next: ([point]) => {
					this.loading = this.data.loading = false;
					this.point = point;
					this.action.pointUpdated(this.point);
					this.setAllTimers();
				},
				error: err => {
					console.error('Ошибка при обновлении события после сброса таймера:\n', err.message);
				},
			}),
		);

		this.moveTimelineSubscription.add(
			interval(10)
				.pipe(filter(() => !this.pausedTime))
				.subscribe({
					next: () => {
						this.moveTimeline();
					},
				}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
		this.moveTimelineSubscription.unsubscribe();
		this.title.setTitle('Countdown');
		window.removeEventListener('beforeunload', this.handleBeforeUnload);
	}

	get interval() {
		return intervalToDuration({
			start: this.pointDate,
			end: new Date(),
		});
	}

	get remainText() {
		const isPast = this.pointDate < (this.pausedTime || new Date());
		const isForward = this.point?.direction === 'forward';

		return isPast
			? isForward
				? DateText.forwardPast
				: DateText.backwardPast
			: isForward
				? DateText.forwardFuture
				: DateText.backwardFuture;
	}

	get remainValue() {
		return this.pausedTime
			? formatDistance(this.pointDate, this.pausedTime, {
					locale: ru,
				})
			: formatDistanceToNow(this.pointDate, {
					locale: ru,
				});
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

	get iterationMode() {
		return this.point?.dates[this.currentIterationIndex]?.mode;
	}

	get iterationTime() {
		return format(this.pointDate, Constants.timeFormat);
	}

	getClosestIteration() {
		!this._closestIterationDate &&
			this.point &&
			getClosestIteration(this.point).then(data => {
				this._closestIterationDate = data.date;
				this.checkIsDirectionCorrect();
			});
	}

	checkIsDirectionCorrect() {
		const currentDate = new Date();
		this.isDirectionCorrect = !!(
			this.point &&
			this._closestIterationDate &&
			((this._closestIterationDate < currentDate && this.point?.direction === 'forward') ||
				(this._closestIterationDate > currentDate && this.point?.direction === 'backward'))
		);
	}

	get directionTitle() {
		return `${this.point?.direction === 'forward' ? 'Прямой отсчёт' : 'Обратный отсчёт'}${
			this.isDirectionCorrect ? '' : '. Но есть нюанс. Подробнее в описании'
		}`;
	}

	get urlModeValue() {
		return this.urlMode.getValue();
	}

	get pointColorNames() {
		return PointColors;
	}

	get pointColorName(): string {
		return (this.point && this.pointColorNames[this.point?.color]) || 'Цвет события';
	}

	get hasTimerLine() {
		return this.timerMode && this.pointDate > (this.pausedTime || new Date());
	}

	get localStorageSound() {
		return localStorage.getItem('sound');
	}

	get soundIcon() {
		return !this.sound ? 'speaker-disabled' : this.localStorageSound === 'long' ? 'speaker-long' : 'speaker-short';
	}

	changeSound() {
		if (this.sound && this.timerPercent() === 100) {
			this.audioFinish.nativeElement.pause();
			this.soundCheckbox.isDisabled = true;
		}
		this.sound = !this.sound;
	}

	zeroPad(num?: number) {
		return String(num).padStart(2, '0');
	}

	setAllTimers(switchCalendarDate = false) {
		this._closestIterationDate = undefined;
		if (this.dates?.[this.currentIterationIndex] || this.urlModeValue) {
			this.pointDate = getPointDate({
				pointDate: parseDate(this.dates?.[this.currentIterationIndex || 0].date, this.timerMode, this.timerMode),
				isGreenwich: this.point?.greenwich,
			});
		}

		this.getClosestIteration();

		if (switchCalendarDate) {
			this.selectedIterationDate = this.pointDate;
		} else {
			this.setTimer();
		}
	}

	setTimer() {
		const currentInterval = this.interval;

		this.timerHours = this.zeroPad((currentInterval.hours && Math.abs(currentInterval.hours)) || 0);

		this.timerMins = this.zeroPad((currentInterval.minutes && Math.abs(currentInterval.minutes)) || 0);
		this.timerSecs = this.zeroPad((currentInterval.seconds && Math.abs(currentInterval.seconds)) || 0);

		this.timerYears = currentInterval.years ? this.zeroPad(Math.abs(currentInterval.years)) : undefined;
		this.timerMonths = currentInterval.months ? this.zeroPad(Math.abs(currentInterval.months)) : undefined;
		this.timerDays = currentInterval.days ? this.zeroPad(Math.abs(currentInterval.days)) : undefined;

		!(this.finalTitleCount % 2) &&
			this.title.setTitle(`
			${currentInterval.years ? Math.abs(currentInterval.years) + 'г. ' : ''}${
				currentInterval.months ? Math.abs(currentInterval.months) + 'м. ' : ''
			}${currentInterval.days ? Math.abs(currentInterval.days) + 'д. ' : ''}
			${this.timerHours}:${this.timerMins}:${this.timerSecs}
		`);
	}

	moveTimeline() {
		if (this.timerMode && this.timerPercent() <= 100 && this.timerPercent() >= 0) {
			const newTimerPercent = +(
				100 /
				((+this.pointDate - +this.initialDate) / (+new Date() - +this.initialDate))
			).toFixed(3);
			switch (true) {
				case newTimerPercent >= 100:
					this.timerPercent.set(100);
					break;
				case newTimerPercent <= 0:
					this.timerPercent.set(0);
					break;
				default:
					this.timerPercent.set(newTimerPercent);
					break;
			}
			if (this.timerPercent() === 100) {
				this.moveTimelineSubscription.unsubscribe();

				if (this.soundNotify) {
					this.notify.close(this.soundNotify);
					this.soundNotify = undefined;
				}

				if (this.sound) {
					this.localStorageSound === 'long' && this.audioFinish.nativeElement.setAttribute('loop', 'true');
					this.audioFinish.nativeElement.play();

					if (this.localStorageSound === 'short') {
						this.soundCheckbox.isDisabled = true;
						this.sound = false;
					}
				}

				this.subscriptions.add(
					interval(500)
						.pipe(take(6))
						.subscribe({
							next: () => {
								this.inverted = !this.inverted;
								this.title.setTitle('⏰⏰⏰');
								this.finalTitleCount++;
							},
						}),
				);
			}
		}
	}

	iterationSwitchHandler(iterationNumber: number) {
		this.currentIterationIndex = isNaN(iterationNumber) ? 0 : iterationNumber;
		this.setAllTimers();
	}

	pause() {
		if (this.pausedTime && this.point) {
			this.initialDate = new Date(+this.initialDate - +this.pausedTime + +new Date());
			const resultDate = new Date(+parseDate(this.point.dates[0].date, true, true) - +this.pausedTime + +new Date());
			const resultDateString = formatDate(resultDate, Constants.reallyFullDateFormat);
			this.point.dates[0].date = resultDateString;
			this.pointDate = resultDate;
			this.pausedTime = undefined;
			this.selectedIterationDate = this.pointDate;
		} else {
			this.pausedTime = new Date();
		}
	}

	showModeStats() {
		this.popupService.show('Статистика режимов', ModeStatsComponent, {
			point: this.point,
		});
	}
}
