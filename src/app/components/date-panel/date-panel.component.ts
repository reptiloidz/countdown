import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	Output,
	ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
	filterIterations,
	getClosestIteration,
	getFirstIteration,
	getPointDate,
	parseDate,
	sortDates,
} from 'src/app/helpers';
import { Iteration, Point } from 'src/app/interfaces';
import {
	ActionService,
	AuthService,
	DataService,
	NotifyService,
} from 'src/app/services';
import { CalendarMode } from 'src/app/types';
import { PanelComponent } from '../panel/panel.component';
import { formatDate } from 'date-fns';
import { Constants } from 'src/app/enums';
import {
	Subscription,
	distinctUntilChanged,
	filter,
	fromEvent,
	mergeMap,
	tap,
	throttle,
	timer,
} from 'rxjs';
import {
	animate,
	query,
	style,
	transition,
	trigger,
} from '@angular/animations';

@Component({
	selector: 'app-date-panel',
	templateUrl: './date-panel.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
	animations: [
		trigger('iterationsInfo', [
			transition(
				':enter',
				query('.tabs__label', [
					style({
						transform: 'rotate(90deg)',
						opacity: 0,
					}),
					animate(
						'.4s .1s cubic-bezier(.1, .79, .24, .95)',
						style({
							transform: 'rotate(45deg)',
							opacity: 1,
						})
					),
				])
			),
			transition(
				':leave',
				query(
					'.tabs__label',
					animate(
						'.4s cubic-bezier(.1, .79, .24, .95)',
						style({
							transform: 'rotate(90deg)',
							opacity: 0,
						})
					)
				)
			),
		]),
	],
})
export class DatePanelComponent implements AfterViewInit {
	@ViewChild('iterationsTabs') private iterationsTabs!: ElementRef;
	@ViewChild('iterationsList') private iterationsList!: ElementRef;
	@ViewChild('panelCalendar') private panelCalendar!: PanelComponent;

	private subscriptions = new Subscription();
	@Input() point: Point | undefined;
	@Input() loading = false;
	@Input() dateLoading = false;
	@Input() urlMode = false;
	@Input() pointDate = new Date();
	@Input() selectedIterationDate = new Date();
	@Input() isEditing = false;
	@Input() isIterationAdded = false;

	@Output() iterationSwitched = new EventEmitter<number>();
	@Output() addIteration = new EventEmitter<void>();

	constructor(
		private data: DataService,
		private router: Router,
		private route: ActivatedRoute,
		private auth: AuthService,
		private cdr: ChangeDetectorRef,
		private action: ActionService,
		private notify: NotifyService
	) {}

	isCalendarPanelOpen = false;
	isCalendarCreated = false;
	currentIterationIndex!: number;
	calendarMode!: CalendarMode;
	firstIterationIndex = 0;
	selectedIterationsNumber = 0;
	hasAccess: boolean | undefined = false;
	iterationsChecked: Number[] = [];
	showIterationsInfo = false;
	removedIterationIndex = 0;
	resizeObserver: ResizeObserver | null = null;
	iterationsListScrollable = false;

	ngOnInit(): void {
		this.subscriptions.add(
			this.action.eventUpdatedPoint$
				.pipe(
					distinctUntilChanged(),
					tap((point) => {
						this.point = point && sortDates(point);
					}),
					mergeMap(() => this.route.queryParams),
					tap((data: any) => {
						if (this.urlMode) return;
						this.currentIterationIndex = data.iteration - 1;
						this.hasAccess = this.hasAccess
							? this.hasAccess
							: this.point
							? this.auth.checkAccessEdit(this.point)
							: false;

						if (this.dates?.length) {
							if (
								this.currentIterationIndex >
									this.dates.length ||
								typeof this.currentIterationIndex !==
									'number' ||
								isNaN(this.currentIterationIndex) ||
								this.currentIterationIndex < 0
							) {
								this.point &&
									!this.isIterationAdded &&
									this.switchIteration(
										getClosestIteration(this.point).index
									);
							}
						} else {
							this.switchIteration();
						}

						setTimeout(() => {
							this.scrollHome();
						}, 500);
					}),
					distinctUntilChanged(),
					tap((data: any) => {
						if (this.urlMode) {
							this.currentIterationIndex = 0;
						} else if (data.iteration) {
							this.currentIterationIndex = data.iteration - 1;
						}
						!this.isIterationAdded &&
							this.iterationSwitched.emit(
								this.currentIterationIndex
							);
					})
				)
				.subscribe({
					next: () => {
						!this.urlMode && this.setIterationsParam();
						this.cdr.detectChanges();
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
						return this.iterationsTabs?.nativeElement.contains(
							eWheel.target as HTMLElement
						);
					}),
					throttle(() => timer(100))
				)
				.subscribe({
					next: (event) => {
						const eWheel = event as WheelEvent;
						if (eWheel.deltaY !== 0) {
							if (this.iterationsTabs.nativeElement) {
								this.iterationsTabs.nativeElement.scrollLeft +=
									eWheel.deltaY;
							}
						}
					},
				})
		);

		this.subscriptions.add(
			this.data.eventEditPoint$.subscribe({
				next: ([point, editPointEvent, newIteration]) => {
					const newIterationIndex =
						newIteration &&
						getFirstIteration([newIteration], point);

					if (
						(editPointEvent === 'iterationAdded' ||
							editPointEvent === 'iterationEdited') &&
						typeof newIterationIndex !== 'undefined'
					) {
						this.currentIterationIndex = newIterationIndex;
					} else if (
						this.currentIterationIndex >=
							this.removedIterationIndex &&
						this.point
					) {
						this.currentIterationIndex =
							getClosestIteration(point).index;
					}
					this.switchIteration(this.currentIterationIndex);
					this.setIterationsParam();
					this.checkIteration();
				},
				error: (err) => {
					console.error(
						'Ошибка при обновлении параметров итерации:\n',
						err.message
					);
				},
			})
		);

		this.switchCalendarPanel();

		this.showIterationsInfo = !!localStorage.getItem('showIterationsInfo');
	}

	ngAfterViewInit(): void {
		if (this.iterationsTabs && this.iterationsList) {
			this.resizeObserver = new ResizeObserver(() => {
				this.iterationsListScrollable =
					this.iterationsList?.nativeElement?.clientWidth !==
					this.iterationsTabs?.nativeElement?.clientWidth -
						parseInt(
							this.iterationsTabs?.nativeElement &&
								getComputedStyle(
									this.iterationsTabs?.nativeElement
								).paddingLeft
						);
				this.cdr.detectChanges();
			});
			this.resizeObserver.observe(this.iterationsTabs?.nativeElement);
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
		this.iterationsTabs &&
			this.resizeObserver?.unobserve(this.iterationsTabs?.nativeElement);
	}

	get pointValue() {
		return this.point;
	}

	get calendarOpen() {
		return this.isCalendarCreated && this.isCalendarPanelOpen;
	}

	get dates() {
		return this.point?.dates;
	}

	get datesBefore() {
		return this.dates?.filter(
			(item) =>
				getPointDate({
					pointDate: parseDate(item.date),
					isGreenwich: this.point?.greenwich,
				}) < new Date()
		);
	}

	get currentTime() {
		return formatDate(new Date(), Constants.fullDateFormat);
	}

	get datesAfter() {
		return this.dates?.filter(
			(item) =>
				getPointDate({
					pointDate: parseDate(item.date),
					isGreenwich: this.point?.greenwich,
				}) > new Date()
		);
	}

	get isDatesLengthPlural() {
		return this.dates && this.dates?.length > 1;
	}
	removeIteration(i: number) {
		let newDatesArray = this.dates?.slice(0);
		newDatesArray && newDatesArray.splice(i, 1);

		this.notify
			.confirm({
				title: 'Удалить итерацию?',
			})
			.subscribe({
				next: () => {
					this.removedIterationIndex = i;
					this.data.editPoint(this.point?.id, {
						...this.point,
						dates: newDatesArray,
					} as Point);
				},
			});
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

	iterationsInfoSwitch(event: Event) {
		this.showIterationsInfo = (event.target as HTMLInputElement).checked;
		localStorage.setItem(
			'showIterationsInfo',
			this.showIterationsInfo ? 'true' : ''
		);
	}

	scrollList(position = 999999) {
		this.iterationsTabs?.nativeElement.scroll({
			left: position,
			behavior: 'smooth',
		});
	}

	scrollHome() {
		(this.iterationsTabs?.nativeElement as HTMLElement)
			?.querySelector('.tabs__item--active input')
			?.scrollIntoView({
				block: 'nearest',
				behavior: 'smooth',
			});
	}

	onIterationsScroll(event: WheelEvent) {
		event.preventDefault();
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

	checkIteration() {
		this.iterationsChecked = this.iterationsList?.nativeElement
			? Array.from(this.iterationsList.nativeElement.children)
					.filter((item: any) => item.querySelector('input')?.checked)
					.map((item: any) => item.querySelector('input')?.name)
			: [];
	}

	checkAllIterations(check = true, iterations?: Iteration[]) {
		[...this.iterationsTabs?.nativeElement.querySelectorAll('input')]
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

	calendarCreated() {
		this.isCalendarCreated = true;
		this.cdr.detectChanges();
	}

	switchIteration(i: number = this.currentIterationIndex) {
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				iteration: i + 1,
			},
			queryParamsHandling: 'merge',
		});

		this.isIterationAdded = false;
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

	dateSelected({ data }: { data: Point[] | Iteration[] }) {
		const iterationIndex =
			this.point && getFirstIteration(data as Iteration[], this.point);
		if ((iterationIndex || iterationIndex === 0) && iterationIndex >= 0) {
			this.switchIteration(iterationIndex);
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
			(this.point && getFirstIteration(filteredIterations, this.point)) ||
			0;
		this.selectedIterationsNumber = filteredIterations.length;
	}

	addIterationClick() {
		this.isIterationAdded = true;
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				iteration: null,
			},
			queryParamsHandling: 'merge',
		});
		this.addIteration.emit();
	}
}
