import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { Subscription, first } from 'rxjs';
import { Point, UserExtraData } from 'src/app/interfaces';
import { ActionService, AuthService, DataService } from 'src/app/services';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { getClosestIteration } from 'src/app/helpers';
import { formatDistanceToNow, intervalToDuration } from 'date-fns';
import { ru } from 'date-fns/locale';

@Component({
	selector: '[app-main-item]',
	templateUrl: './main-item.component.html',
})
export class MainItemComponent implements OnInit, OnDestroy {
	@ViewChild('pointCheckbox') private pointCheckbox!: CheckboxComponent;

	private subscriptions = new Subscription();
	@Input() point!: Point;
	@Input() isLine = false;
	@Input() isSm = false;
	@Input() showSec = true;
	@Input() isEdit = false;
	@Output() pointCheck = new EventEmitter();

	loading = false;
	authorLoading = false;
	timerYears: number | string | undefined;
	timerMonths: number | string | undefined;
	timerDays: number | string | undefined;
	timerHours!: number | string;
	timerMins!: number | string;
	timerSecs!: number | string;

	constructor(
		private data: DataService,
		private auth: AuthService,
		private action: ActionService
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.data.eventStartRemovePoint$.subscribe({
				next: (id) => {
					if (this.point.id === id) {
						this.loading = true;
					}
				},
				error: (err) => {
					console.error(
						'Ошибка при удалении события:\n',
						err.message
					);
				},
			})
		);

		this.subscriptions.add(
			this.data.eventRemovePoint$.subscribe({
				next: () => {
					this.loading = this.data.loading = false;
				},
			})
		);

		this.subscriptions.add(
			this.action.eventPointsCheckedAll$.subscribe({
				next: (check) => {
					this.pointCheckbox &&
						!this.pointCheckbox.isDisabled &&
						(this.pointCheckbox.isChecked = check);
				},
			})
		);

		this.subscriptions.add(
			this.action.eventIntervalSwitched$.subscribe({
				next: () => {
					this.setTimer();
				},
				error: (err) => {
					console.error(
						'Ошибка при обновлении таймеров:\n',
						err.message
					);
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get isAuth() {
		return this.auth.isAuthenticated;
	}

	get closestIteration() {
		return getClosestIteration(this.point).date;
	}

	get closestIterationRemain() {
		return (
			(this.closestIteration < new Date() ? 'Прошло' : 'Осталось') +
			' ' +
			formatDistanceToNow(this.closestIteration, {
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
		return intervalToDuration({
			start: this.closestIteration,
			end: new Date(),
		});
	}

	get isDirectionCorrect() {
		const currentDate = new Date();

		return (
			(this.closestIteration < currentDate &&
				this.point.direction === 'forward') ||
			(this.closestIteration > currentDate &&
				this.point.direction === 'backward')
		);
	}

	get directionTitle() {
		return `${
			this.point.direction === 'forward'
				? 'Прямой отсчёт'
				: 'Обратный отсчёт'
		}${
			this.isDirectionCorrect
				? ''
				: '. Но есть нюанс. Подробнее в описании'
		}`;
	}

	zeroPad(num?: number) {
		return String(num).padStart(2, '0');
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
	}

	delete(id: string | undefined) {
		this.data.removePoints({ id });
	}

	checkPoint() {
		this.pointCheck.emit();
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
					error: (err) => {
						console.error(
							'Ошибка при получении информации о пользователе:\n',
							err.message
						);
					},
					complete: () => {
						this.authorLoading = false;
					},
				});
		}
	}

	setDateNow() {}
}
