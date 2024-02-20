import {
	Component,
	OnInit,
	OnDestroy,
	ViewChild,
	ElementRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
	interval,
	Subscription,
	distinctUntilChanged,
	tap,
	mergeMap,
	filter,
} from 'rxjs';
import { Point, CalendarMode, Iteration } from 'src/app/interfaces';
import { DataService, AuthService } from 'src/app/services';
import {
	format,
	formatDistanceToNow,
	formatDuration,
	intervalToDuration,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { Constants, DateText } from 'src/app/enums';
import { getPointDate, sortDates } from 'src/app/helpers';

@Component({
	selector: 'app-point',
	templateUrl: './point.component.html',
})
export class PointComponent implements OnInit, OnDestroy {
	@ViewChild('iterationsList') private iterationsList!: ElementRef;
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
	removedIterationIndex = 0;
	iterationsChecked: Number[] = [];
	selectedIterationDate = new Date();
	selectedIterationsNumber = 0;

	private subscriptions = new Subscription();

	constructor(
		private data: DataService,
		private router: Router,
		private route: ActivatedRoute,
		private auth: AuthService
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
								this.switchIteration(this.dates.length - 1);
							}
						} else {
							this.switchIteration();
						}
					})
				)
				.subscribe({
					next: () => {
						this.setAllTimers(true);
						this.dateLoading = false;
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
			interval(1000)
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
		return format(this.pointDate, Constants.fullDateFormat);
	}

	get isDatesLengthPlural() {
		return this.dates && this.dates?.length > 1;
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

			this.setTimer();
			this.setDateTimer();
			this.setRemainText();
		}

		if (switchCalendarDate) {
			this.selectedIterationDate = this.pointDate;
		}
	}

	setTimer() {
		const currentInterval = this.interval;
		this.timer = `${
			(currentInterval.hours && Math.abs(currentInterval.hours)) || 0
		}:${this.zeroPad(
			(currentInterval.minutes && Math.abs(currentInterval.minutes)) || 0
		)}:${this.zeroPad(
			(currentInterval.seconds && Math.abs(currentInterval.seconds)) || 0
		)}`;
	}

	setDateTimer() {
		const currentInterval = this.interval;
		if (
			currentInterval.years ||
			currentInterval.months ||
			currentInterval.days
		) {
			this.dateTimer = formatDuration(
				{
					years:
						currentInterval.years &&
						Math.abs(currentInterval.years),
					months:
						currentInterval.months &&
						Math.abs(currentInterval.months),
					days:
						currentInterval.days && Math.abs(currentInterval.days),
				},
				{
					locale: ru,
				}
			);
		} else {
			this.dateTimer = '';
		}
	}

	setRemainText() {
		this.remainTextValue =
			this.remainText +
			' ' +
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
		// TODO: при переключении итераций постараться выделять те, что находятся в одной выбранной дате?
		this.selectedIterationsNumber = 0;
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
			.filter((item: any) => item.querySelector('input').checked)
			.map((item: any) => item.querySelector('input').name);
	}

	checkAllIterations() {
		this.iterationsList.nativeElement
			.querySelectorAll('input')
			.forEach((item: any) => {
				item.checked = true;
			});
		this.checkIteration();
	}

	uncheckAllIterations() {
		this.iterationsList.nativeElement
			.querySelectorAll('input')
			.forEach((item: any) => {
				item.checked = false;
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

	dateSelected({
		date,
		mode,
		data,
	}: {
		date: Date;
		mode: CalendarMode;
		data: Point[] | Iteration[];
	}) {
		const iterationIndex = this.point?.dates.findIndex(
			(item) => item.date === (data[0] as Iteration)?.date
		);
		if ((iterationIndex || iterationIndex === 0) && iterationIndex >= 0) {
			this.switchIteration(iterationIndex);
			this.selectedIterationsNumber = data.length;
		} else {
			this.selectedIterationsNumber = 0;
		}
	}
}
