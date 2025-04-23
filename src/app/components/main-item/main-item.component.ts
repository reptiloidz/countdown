import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnDestroy,
	OnInit,
	ViewChild,
	ContentChild,
	TemplateRef,
	ElementRef,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
} from '@angular/core';
import { Subscription, first } from 'rxjs';
import { Point, PointMode, UserExtraData } from 'src/app/interfaces';
import { ActionService, AuthService, DataService, NotifyService } from 'src/app/services';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { getClosestIteration, parseDate } from 'src/app/helpers';
import { compareAsc, formatDistanceToNow, intervalToDuration } from 'date-fns';
import { ru } from 'date-fns/locale';

@Component({
	selector: '[app-main-item]',
	templateUrl: './main-item.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainItemComponent implements OnInit, OnDestroy {
	@ViewChild('pointCheckbox') private pointCheckbox!: CheckboxComponent;
	@ContentChild('checkboxTemplate') checkboxTemplate: TemplateRef<unknown> | undefined;

	private readonly subscriptions = new Subscription();
	@Input() point!: Point;
	@Input() isLine = false;
	@Input() isSm = false;
	@Input() isPopup = false;
	@Input() showSec = true;
	@Input() isEdit = false;
	@Output() pointCheck = new EventEmitter();

	loading = false;
	authorLoading = false;
	remainCalculated = false;
	timerYears: number | string | undefined;
	timerMonths: number | string | undefined;
	timerDays: number | string | undefined;
	timerHours!: number | string;
	timerMins!: number | string;
	timerSecs!: number | string;
	isBoardVisible = false;
	isPointEdited = false;

	_closestIteration!: {
		date: Date;
		index: number;
		mode?: PointMode | undefined;
	};
	_closestIterationDate = new Date();
	_futureIterationDate: Date | undefined;
	_closestIterationModeSet = false;
	closestIterationMode: PointMode | undefined;

	constructor(
		private data: DataService,
		private auth: AuthService,
		private action: ActionService,
		private notify: NotifyService,
		private el: ElementRef,
		private cdr: ChangeDetectorRef,
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.data.eventStartRemovePoint$.subscribe({
				next: id => {
					if (this.point.id === id) {
						this.loading = true;
					}
					this.cdr.detectChanges();
				},
				error: err => {
					console.error('Ошибка при удалении события:\n', err.message);
				},
			}),
		);

		this.subscriptions.add(
			this.data.eventRemovePoint$.subscribe({
				next: () => {
					this.loading = this.data.loading = false;
					this.cdr.detectChanges();
				},
			}),
		);

		this.subscriptions.add(
			this.data.eventEditPoint$.subscribe({
				next: () => {
					this._futureIterationDate = undefined;
					this.isPointEdited = true;
					this.getClosestIteration();
					this.cdr.markForCheck();
				},
			}),
		);

		this.subscriptions.add(
			this.action.eventPointsCheckedAll$.subscribe({
				next: check => {
					this.pointCheckbox && !this.pointCheckbox.isDisabled && (this.pointCheckbox.isChecked = check);
					this.cdr.markForCheck();
				},
			}),
		);

		this.subscriptions.add(
			this.action.eventIntervalSwitched$.subscribe({
				next: () => {
					this.isBoardVisible = !!this.el.nativeElement.querySelector('.board--visible');
					this.isBoardVisible && this.setTimer();
					this.cdr.markForCheck();
				},
				error: err => {
					console.error('Ошибка при обновлении таймеров:\n', err.message);
				},
			}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get isAuth() {
		return this.auth.isAuthenticated;
	}

	get closestIterationRemain() {
		return (
			(this._closestIterationDate < new Date() ? 'Прошло:' : 'Осталось:') +
			' ' +
			formatDistanceToNow(this._closestIterationDate, {
				locale: ru,
			}) +
			(this.isDirectionCorrect
				? ''
				: this.point.direction === 'forward'
					? '. Прямой отсчёт, но событие ещё не наступило'
					: '. Обратный отсчёт, но событие уже в прошлом')
		);
	}

	get interval() {
		this.getClosestIteration();
		return intervalToDuration({
			start: this._closestIteration?.date,
			end: new Date(),
		});
	}

	get isDirectionCorrect() {
		const currentDate = new Date();

		return (
			(this._closestIterationDate < currentDate && this.point.direction === 'forward') ||
			(this._closestIterationDate > currentDate && this.point.direction === 'backward')
		);
	}

	get directionTitle() {
		return `${this.point.direction === 'forward' ? 'Прямой отсчёт' : 'Обратный отсчёт'}${
			this.isDirectionCorrect ? '' : '. Но&nbsp;есть нюанс. Подробнее в&nbsp;описании'
		}`;
	}

	getClosestIteration() {
		if (!this._futureIterationDate) {
			const datesSorted = this.point.dates.sort((a, b) => compareAsc(parseDate(a.date), parseDate(b.date)));
			for (const item of datesSorted) {
				const parsedDate = parseDate(item.date);
				if (parsedDate > new Date()) {
					this._futureIterationDate = parsedDate;
					break;
				}
			}
		}

		getClosestIteration(this.point).then(res => {
			if (this._futureIterationDate) {
				const toFuture = +this._futureIterationDate - +new Date();

				if (this.isPointEdited || (toFuture < 0 && toFuture > -1000 && this.point.repeatable)) {
					this._closestIterationDate = res.date || new Date();
					this._closestIteration = res;
					this._futureIterationDate = undefined;
				}
			}

			if (this.isPointEdited || !this._closestIteration) {
				this._closestIterationDate = res.date || new Date();
				this._closestIteration = res;
				this.remainCalculated = true;
			}

			if (this.isPointEdited || !this._closestIterationModeSet) {
				this.closestIterationMode = res.mode || undefined;
				this._closestIterationModeSet = true;
			}
			this.isPointEdited = false;
		});
	}

	zeroPad(num?: number) {
		return String(num).padStart(2, '0');
	}

	setTimer() {
		const currentInterval = this.interval;

		this.timerHours = this.zeroPad((currentInterval.hours && Math.abs(currentInterval.hours)) || 0);
		this.timerMins = this.zeroPad((currentInterval.minutes && Math.abs(currentInterval.minutes)) || 0);
		this.timerSecs = this.zeroPad((currentInterval.seconds && Math.abs(currentInterval.seconds)) || 0);

		this.timerYears = currentInterval.years ? this.zeroPad(Math.abs(currentInterval.years)) : undefined;
		this.timerMonths = currentInterval.months ? this.zeroPad(Math.abs(currentInterval.months)) : undefined;
		this.timerDays = currentInterval.days ? this.zeroPad(Math.abs(currentInterval.days)) : undefined;
		this.cdr.markForCheck();
	}

	delete(id: string | undefined) {
		this.data.removePoints({ id });
	}

	checkPoint() {
		this.pointCheck.emit();
		this.cdr.markForCheck();
	}

	loadUserInfo(id?: string) {
		if (id && !this.point.userInfo) {
			this.authorLoading = true;
			this.auth
				.getUserData(id)
				.pipe(first())
				.subscribe({
					next: (userData: UserExtraData) => {
						this.point.userInfo = userData;
					},
					error: err => {
						console.error('Ошибка при получении информации о пользователе:\n', err.message);
					},
					complete: () => {
						this.authorLoading = false;
					},
				});
		}
	}

	setDateNow() {
		this.notify
			.confirm({
				title: 'Обновить время события?',
			})
			.subscribe({
				next: () => {
					this.point && this.data.setDateNow(this.point);
				},
			});
	}
}
