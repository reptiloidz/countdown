import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	effect,
	ElementRef,
	inject,
	input,
	OnDestroy,
	OnInit,
	output,
	signal,
	untracked,
	ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { CalendarComponent } from 'src/app/components/calendar/calendar.component';
import { CheckboxComponent } from 'src/app/components/checkbox/checkbox.component';
import { SvgComponent } from 'src/app/components/svg/svg.component';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';
import { CheckCopiesPipe } from 'src/app/pipes/check-copies.pipe';
import { TimeRemainPipe } from 'src/app/pipes/time-remain.pipe';
import { TimeRemainTextPipe } from 'src/app/pipes/time-remain-text.pipe';
import { PanelComponent } from '../panel/panel.component';
import {
	filterIterations,
	getClosestIteration,
	getFirstIteration,
	getPointDate,
	parseDate,
	setIterationsMode,
	sortDates,
} from 'src/app/helpers';
import { Iteration, Point } from 'src/app/interfaces';
import { ActionService, AuthService, DataService, NotifyService } from 'src/app/services';
import { CalendarMode } from 'src/app/types';
import { formatDate } from 'date-fns';
import { Constants } from 'src/app/enums';
import { Subscription, combineLatestWith, debounceTime, distinctUntilChanged, filter, fromEvent, tap } from 'rxjs';
import { animate, query, style, transition, trigger } from '@angular/animations';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
	selector: 'app-date-panel',
	standalone: true,
	imports: [
		CommonModule,
		ScrollingModule,
		PanelComponent,
		CalendarComponent,
		ButtonComponent,
		CheckboxComponent,
		TooltipComponent,
		SvgComponent,
		CheckCopiesPipe,
		TimeRemainPipe,
		TimeRemainTextPipe,
	],
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
						}),
					),
				]),
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
						}),
					),
				),
			),
		]),
		trigger('extraPanel', [
			transition(':enter', [
				style({
					opacity: 0,
				}),
				animate(
					'.2s',
					style({
						opacity: 1,
					}),
				),
			]),
		]),
	],
})
export class DatePanelComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('iterationsTabs') iterationsTabs!: ElementRef;
	@ViewChild('virtualScrollViewport') virtualScrollViewport!: CdkVirtualScrollViewport;
	@ViewChild('iterationsList') iterationsList!: ElementRef;
	@ViewChild('panelCalendar') private panelCalendar!: PanelComponent;

	private subscriptions = new Subscription();
	pointInput = input<Point | undefined>(undefined, { alias: 'point' });
	point = signal<Point | undefined>(undefined);
	loading = input(false);
	dateLoading = input(false);
	urlMode = input(false);
	selectedIterationDate = input(new Date());
	isEditing = input(false);
	isIterationAddedInput = input(false, { alias: 'isIterationAdded' });
	private readonly isIterationAddedLocal = signal(false);
	isIterationAdded = computed(() => this.isIterationAddedInput() || this.isIterationAddedLocal());
	pointDate = input(new Date());

	iterationSwitched = output<number>();
	addIteration = output<void>();

	private readonly data = inject(DataService);
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);
	private readonly auth = inject(AuthService);
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly action = inject(ActionService);
	private readonly notify = inject(NotifyService);
	private readonly elementRef = inject(ElementRef);

	constructor() {
		effect(
			() => {
				const incoming = this.pointInput();
				if (incoming === undefined) {
					return;
				}

				const current = untracked(() => this.point());
				if (incoming !== current) {
					this.point.set(incoming);
				}
			},
			{ allowSignalWrites: true },
		);
	}

	isCalendarPanelOpen = false;
	isCalendarCreated = false;
	currentIterationIndex!: number;
	calendarMode!: CalendarMode;
	firstIterationIndex = 0;
	selectedIterationsNumber = 0;
	hasAccess: boolean | undefined = false;
	iterationsChecked: boolean[] = [];
	showIterationsInfo = !!localStorage.getItem('showIterationsInfo');
	removedIterationIndex = 0;
	resizeObserver: ResizeObserver | null = null;
	iterationsListScrollable = false;
	datesBeforeLength = 0;
	datesAfterLength = 0;
	datesLength = 0;
	combinedDates: { type: string; data?: Point | Iteration; time?: string }[] = [];
	itemSize = signal(184);
	itemClass = signal('');

	ngOnInit(): void {
		this.subscriptions.add(
			this.action.eventUpdatedPoint$
				.pipe(
					combineLatestWith(this.route.queryParams),
					filter(([point]) => {
						return !!point;
					}),
					tap(([point]) => {
						this.point.set(point && setIterationsMode(sortDates(point)));
						this.datesLength = this.point()?.dates.length ?? 0;
						!this.urlMode() && this.setIterationsParam();
						!this.iterationsChecked.length && this.updateIterationsCheckedList();
					}),
					distinctUntilChanged(),
				)
				.subscribe({
					next: ([, data]) => {
						if (this.urlMode()) return;
						this.currentIterationIndex = data['iteration'] - 1;
						this.hasAccess = this.hasAccess
							? this.hasAccess
							: this.point()
								? this.auth.checkAccessEdit(this.point()!)
								: false;

						if (this.dates?.length && this.point()?.repeatable) {
							if (
								this.currentIterationIndex > this.dates.length ||
								typeof this.currentIterationIndex !== 'number' ||
								isNaN(this.currentIterationIndex) ||
								this.currentIterationIndex < 0
							) {
								this.point() &&
									!this.isIterationAdded() &&
									getClosestIteration(this.point()!).then(({ index }) => this.switchIteration(index));
							}
						} else {
							this.switchIteration();
						}

						setTimeout(() => {
							this.scheduleIterationsLayout();
							this.scrollList('home');
						}, 1000);

						if (this.urlMode()) {
							this.currentIterationIndex = 0;
						} else if (data['iteration']) {
							this.currentIterationIndex = data['iteration'] - 1;
						}
						!this.isIterationAdded() && this.iterationSwitched.emit(this.currentIterationIndex);
					},
					error: err => {
						console.error('Ошибка при обновлении таймеров:\n', err.message);
					},
				}),
		);

		this.subscriptions.add(
			this.data.eventEditPoint$.subscribe({
				next: async ([point, editPointEvent, newIteration]) => {
					const newIterationIndex = newIteration && getFirstIteration([newIteration], point);

					if (
						(editPointEvent === 'iterationAdded' || editPointEvent === 'iterationEdited') &&
						typeof newIterationIndex !== 'undefined'
					) {
						this.currentIterationIndex = newIterationIndex;
					} else if (this.currentIterationIndex >= this.removedIterationIndex && this.point()) {
						this.currentIterationIndex = (await getClosestIteration(point)).index;
					}
					this.switchIteration(this.currentIterationIndex);
					this.setIterationsParam();
					if (this.datesLength !== point.dates.length) {
						this.checkAllIterations(false);
						this.datesLength = point.dates.length;
					}
					this.scheduleIterationsLayout();
					this.getCombineDates();
				},
				error: err => {
					console.error('Ошибка при обновлении параметров итерации:\n', err.message);
				},
			}),
		);

		this.subscriptions.add(
			this.action.eventIntervalSwitched$.subscribe({
				next: () => {
					if (
						this.datesBeforeLength !== this.datesBefore?.length ||
						this.datesAfterLength !== this.datesAfter?.length
					) {
						this.getCombineDates();
					}
				},
			}),
		);

		this.subscriptions.add(
			fromEvent(window, 'resize')
				.pipe(debounceTime(200))
				.subscribe({
					next: () => {
						setTimeout(() => {
							this.scheduleIterationsLayout();
						}, 100);
					},
				}),
		);

		this.switchCalendarPanel();
		this.updateItemSize();
	}

	ngAfterViewInit(): void {
		this.resizeObserver = new ResizeObserver(() => {
			this.scheduleIterationsLayout();
		});
		this.resizeObserver.observe(this.elementRef?.nativeElement);
		this.scheduleIterationsLayout();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
		this.iterationsTabs && this.resizeObserver?.unobserve(this.iterationsTabs?.nativeElement);
		this.iterationsTabs && this.action.pointUpdated(undefined);
	}

	get pointValue() {
		return this.point();
	}

	get calendarOpen() {
		return this.isCalendarCreated && this.isCalendarPanelOpen;
	}

	get dates() {
		return this.point()?.dates;
	}

	get datesBefore() {
		return this.dates?.filter(
			item =>
				getPointDate({
					pointDate: parseDate(item.date),
					isGreenwich: this.point()?.greenwich,
				}) < new Date(),
		);
	}

	get currentTime() {
		return formatDate(new Date(), Constants.fullDateFormat);
	}

	get datesAfter() {
		return this.dates?.filter(
			item =>
				getPointDate({
					pointDate: parseDate(item.date),
					isGreenwich: this.point()?.greenwich,
				}) > new Date(),
		);
	}

	get isDatesLengthPlural() {
		return this.dates && this.dates?.length > 1;
	}

	get iterationsCheckedForRemove() {
		return this.iterationsChecked.filter(item => item);
	}

	updateItemSize() {
		let itemSize = 0;
		if (this.hasAccess && this.point()?.modes) {
			this.itemClass.set('tabs__item--lg');
			itemSize = 184;
		} else if (this.hasAccess || this.point()?.modes) {
			this.itemClass.set('tabs__item--md');
			itemSize = 158;
		} else {
			itemSize = 116;
		}

		this.itemSize.set(itemSize);
	}

	getCombineDates() {
		this.datesBeforeLength = this.datesBefore?.length ?? 0;
		this.datesAfterLength = this.datesAfter?.length ?? 0;
		this.combinedDates = [
			...(this.datesBefore?.map(item => ({ type: 'date', data: item, time: 'past' })) || []),
			{ type: 'home' },
			...(this.datesAfter?.map(item => ({ type: 'date', data: item, time: 'future' })) || []),
		];
	}

	updateIterationsCheckedList(checked = false) {
		this.iterationsChecked = [];
		this.point()?.dates.forEach((item, i) => {
			this.iterationsChecked.push(checked);
		});
	}

	scheduleIterationsLayout() {
		requestAnimationFrame(() => {
			this.getIterationsListScrollable();
		});
	}

	getIterationsListScrollable() {
		if (!this.iterationsTabs?.nativeElement) {
			return;
		}

		const tabsEl = this.iterationsTabs.nativeElement;
		const listEl = this.iterationsList?.nativeElement;
		const padding =
			parseInt(getComputedStyle(tabsEl).paddingLeft, 10) + parseInt(getComputedStyle(tabsEl).paddingRight, 10);

		this.iterationsListScrollable = listEl ? listEl.clientWidth > tabsEl.clientWidth - padding : false;

		this.updateItemSize();
		this.cdr.detectChanges();
	}

	removeIteration(i: number) {
		let newDatesArray = this.dates?.slice(0);
		newDatesArray?.splice(i, 1);

		this.notify
			.confirm({
				title: 'Удалить итерацию?',
			})
			.subscribe({
				next: () => {
					this.removedIterationIndex = i;
					this.data.editPoint(this.point()?.id, {
						...this.point()!,
						dates: newDatesArray,
					} as Point);
				},
			});
	}

	removeCheckedIterations() {
		let newDatesArray = this.dates?.slice(0);
		newDatesArray = newDatesArray?.filter((item, i: any) => !this.iterationsChecked[i]);

		this.notify
			.confirm({
				title: `Удалить выбранные итерации (${this.iterationsCheckedForRemove.length} шт.)? Если выбраны все, останется только последняя`,
			})
			.subscribe({
				next: () => {
					this.data.editPoint(this.point()?.id, {
						...this.point()!,
						dates: newDatesArray?.length ? newDatesArray : [this.dates?.[this.dates?.length - 1]],
					} as Point);
					this.checkAllIterations(false);
				},
			});
	}

	switchCalendarPanel(value?: boolean) {
		if (typeof value !== 'undefined') {
			this.isCalendarPanelOpen = value;
			localStorage.setItem('isCalendarPanelOpen', value.toString());
		} else {
			this.isCalendarPanelOpen = localStorage.getItem('isCalendarPanelOpen') === 'true';
		}
	}

	iterationsInfoSwitch(event: Event) {
		this.showIterationsInfo = (event.target as HTMLInputElement).checked;
		localStorage.setItem('showIterationsInfo', this.showIterationsInfo ? 'true' : '');
	}

	scrollList(position: 'start' | 'end' | 'home') {
		switch (position) {
			case 'start':
				this.virtualScrollViewport?.scrollTo({ start: 0, behavior: 'smooth' });
				break;
			case 'end':
				this.virtualScrollViewport?.scrollTo({ end: 0, behavior: 'smooth' });
				break;
			case 'home':
				this.virtualScrollViewport?.scrollToIndex(this.currentIterationIndex, 'smooth');
				break;
		}
	}

	dateChecked({ data, check }: { data: Point[] | Iteration[]; check: boolean }) {
		this.checkAllIterations(check, data as Iteration[]);
	}

	checkIteration(event: Event, i: number) {
		this.action.iterationsChecked();
		this.iterationsChecked[i] = (event.target as HTMLInputElement).checked;
	}

	updateIterationCheckboxes() {
		Array.from(this.iterationsList.nativeElement.children).forEach(item => {
			const checkbox = (item as HTMLElement).querySelector('input');
			if (checkbox !== null) {
				const checkboxName = parseFloat(checkbox.getAttribute('name') ?? '0');
				checkbox && (checkbox.checked = this.iterationsChecked[checkboxName]);
			}
		});
	}

	checkAllIterations(check = true, iterations?: Iteration[]) {
		if (iterations?.length) {
			this.iterationsChecked.forEach((item, i) => {
				if (iterations.some(iteration => iteration.date === this.point()?.dates[i].date)) {
					this.iterationsChecked[i] = check;
				}
			});
		} else {
			this.updateIterationsCheckedList(check);
		}
		this.updateIterationCheckboxes();
		this.action.iterationsChecked();
	}

	calendarCreated() {
		this.isCalendarCreated = true;
		this.cdr.markForCheck();
	}

	switchIteration(i: number = this.currentIterationIndex) {
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				iteration: isNaN(i) ? null : i + 1,
			},
			queryParamsHandling: 'merge',
			replaceUrl: true,
		});

		this.isIterationAddedLocal.set(false);
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
		const iterationIndex = this.point() && getFirstIteration(data as Iteration[], this.point()!);
		if ((iterationIndex || iterationIndex === 0) && iterationIndex >= 0) {
			this.switchIteration(iterationIndex);
		}
	}

	setIterationsParam() {
		const filteredIterations = filterIterations({
			date: this.pointDate(),
			iterations: this.point()?.dates || [],
			activeMode: this.calendarMode,
			greenwich: this.point()?.greenwich || false,
		});
		this.firstIterationIndex = (this.point() && getFirstIteration(filteredIterations, this.point()!)) || 0;
		this.selectedIterationsNumber = filteredIterations.length;
	}

	addIterationClick() {
		this.isIterationAddedLocal.set(true);
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
