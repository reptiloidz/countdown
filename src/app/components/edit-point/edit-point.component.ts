import {
	Component,
	OnInit,
	OnDestroy,
	ChangeDetectionStrategy,
	ViewChild,
	ElementRef,
	ChangeDetectorRef,
	HostBinding,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
	Subscription,
	interval,
	debounce,
	timer,
	BehaviorSubject,
	of,
	distinctUntilChanged,
	pairwise,
	tap,
	startWith,
	mergeMap,
	filter,
	combineLatestWith,
	from,
	take,
} from 'rxjs';
import {
	Point,
	Iteration,
	UserExtraData,
	SwitcherItem,
	SelectArray,
	PointMode,
	GroupEmoji,
} from 'src/app/interfaces';
import {
	DataService,
	AuthService,
	ActionService,
	NotifyService,
} from 'src/app/services';
import { addMonths, addYears, format } from 'date-fns';
import {
	getInvertedObject,
	getPointDate,
	isDateValid,
	parseDate,
	setIterationsMode,
	sortDates,
} from 'src/app/helpers';
import { Constants, PointColors } from 'src/app/enums';
import {
	CalendarMode,
	DifferenceMode,
	EditPointEvent,
	PointColorTypes,
} from 'src/app/types';
import { DropComponent } from '../drop/drop.component';
import { fetchEmojis, fetchMessages } from 'emojibase';
import { DatePanelComponent } from '../date-panel/date-panel.component';

enum EditPointType {
	Create = 'create',
	Edit = 'edit',
	CreateUrl = 'create-url',
}

enum EditPointSuccessMessage {
	pointAdded = 'Событие добавлено',
	pointEdited = 'Событие изменено',
	iterationAdded = 'Итерация добавлена',
	iterationEdited = 'Итерация изменена',
	iterationsGenerated = 'Итерации сгенерированы',
	iterationRemoved = 'Итерация удалена',
	iterationsRemoved = 'Итерации удалены',
}

@Component({
	selector: 'app-edit-point',
	templateUrl: './edit-point.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
})
export class EditPointComponent implements OnInit, OnDestroy {
	@ViewChild('iterationsList') private iterationsList!: ElementRef;
	@ViewChild('iterationForm') private iterationForm!: ElementRef;
	@ViewChild('colorDrop') private colorDrop!: DropComponent;
	@ViewChild('modesDrop') private modesDrop!: DropComponent;
	@ViewChild('datePanel') datePanel!: DatePanelComponent;
	@HostBinding('class') class = 'main__inner';
	type = EditPointType.Edit;
	form!: FormGroup;
	point: Point | undefined;
	pointDate = new Date();
	difference = 0;
	loading = false;
	validatorDifferenceMaxLength = 8;
	currentIterationIndex!: number;
	firstIterationIndex = 0;
	removedIterationIndex = 0;
	isIterationAdded = false;
	isCalendarCreated = false;
	isCalendarPanelOpen = false;
	iterationControls = {};
	iterationsChecked: Number[] = [];
	selectedIterationDate = new Date();
	selectedIterationsNumber = 0;
	calendarMode!: CalendarMode;
	userData!: UserExtraData;
	isIterationSwitched = false;
	showIterationsInfo = false;
	pointModes: PointMode[] = [];
	isModesDropOpened = false;
	differenceMode: DifferenceMode =
		(localStorage.getItem('differenceMode') as DifferenceMode) || 'minutes';
	dateUrlMode: 'date' | 'timer' = 'date';

	directionList: SwitcherItem[] = [
		{
			text: 'Обратный отсчёт',
			value: 'backward',
			icon: 'rotate-left',
		},
		{
			text: 'Прямой отсчёт',
			value: 'forward',
			icon: 'rotate-right',
		},
	];

	dateModeList: SwitcherItem[] = [
		{
			text: 'Дата',
			value: 'date',
			icon: 'calendar-clock',
		},
		{
			text: 'Таймер',
			value: 'timer',
			icon: 'hourglass',
		},
	];

	differenceModeArray: SelectArray[] = [
		{
			key: 'Минуты',
			value: 'minutes',
		},
		{
			key: 'Часы',
			value: 'hours',
		},
		{
			key: 'Дни',
			value: 'days',
		},
		{
			key: 'Недели',
			value: 'weeks',
		},
		{
			key: 'Месяцы',
			value: 'months',
		},
		{
			key: 'Годы',
			value: 'years',
		},
	];

	emojis: GroupEmoji[] = [];

	private _debounceTime = 500;
	private subscriptions = new Subscription();
	private notifies: {
		[key: string]: {
			date: Date | undefined;
			remove: () => void;
		};
	} = {
		greenwich: {
			date: undefined,
			remove: () => {
				this.closeNotify('greenwich');
			},
		},
		repeatable: {
			date: undefined,
			remove: () => {
				this.closeNotify('repeatable');
			},
		},
		timer: {
			date: undefined,
			remove: () => {
				this.closeNotify('timer');
			},
		},
	};

	checking = new BehaviorSubject<boolean>(true);

	constructor(
		private data: DataService,
		private route: ActivatedRoute,
		private router: Router,
		private auth: AuthService,
		private cdr: ChangeDetectorRef,
		private action: ActionService,
		private notify: NotifyService
	) {}

	ngOnInit(): void {
		this.form = new FormGroup({
			title: new FormControl(null, [
				Validators.required,
				Validators.maxLength(100),
			]),
			description: new FormControl(null, [Validators.maxLength(10000)]),
			difference: new FormControl(this.difference, [
				Validators.required,
				Validators.pattern(
					`^-?[0-9]{1,${this.validatorDifferenceMaxLength}}$`
				),
			]),
			direction: new FormControl('backward', [Validators.required]),
			greenwich: new FormControl(false),
			repeatable: new FormControl(false),
			public: new FormControl(false),
			color: new FormControl('gray'),
			iterationsForm: new FormGroup({
				rangePeriod: new FormControl(1, [
					Validators.required,
					Validators.min(1),
				]),
				repeatsMode: new FormControl('setRepeatsAmount', [
					Validators.required,
				]),
				rangeAmount: new FormControl(2, [
					Validators.required,
					Validators.min(2),
				]),
				periodicity: new FormControl('perMinutes', [
					Validators.required,
				]),
				monthOptions: new FormControl('dayOfMonth', [
					Validators.required,
				]),
			}),
			pointModesForm: new FormGroup({
				firstModeTitle: new FormControl(null, [
					Validators.maxLength(100),
				]),
				secondModeTitle: new FormControl(null, [
					Validators.maxLength(100),
				]),
				firstModeEmoji: new FormControl('👷'),
				secondModeEmoji: new FormControl('🏝'),
			}),
		});

		this.subscriptions.add(
			this.route.url.subscribe({
				next: (data: any) => {
					this.type =
						data[0].path === 'create'
							? EditPointType.Create
							: data[0].path === 'edit'
							? EditPointType.Edit
							: EditPointType.CreateUrl;
				},
			})
		);

		this.subscriptions.add(
			this.route.queryParams
				.pipe(
					tap(() => {
						if (this.isCreation || this.isIterationAdded) {
							this.checking.next(false);
						}
					}),
					filter(() => !this.isCreation && !this.isIterationAdded),
					distinctUntilChanged(),
					mergeMap(() => this.route.params),
					mergeMap((data: any) => {
						return data['id']
							? this.data.fetchPoint(data['id'])
							: of(undefined);
					}),
					tap((point: Point | undefined) => {
						if (!this.isCreation && !this.isIterationAdded) {
							this.point = point;
						}
					}),
					mergeMap(() => this.auth.getUserData(this.point?.user)),
					tap((userData) => {
						this.userData = userData;
					}),
					combineLatestWith(this.auth.eventEditAccessCheck$)
				)
				.subscribe({
					next: ([, { pointId, access }]) => {
						this.point && this.data.putPoint(this.point);
						if (
							access &&
							(pointId === this.point?.id || !pointId)
						) {
							this.checking.next(false);
							this.setValues();
							this.pointModes = this.point?.modes || [];
						}
						if (!this.isCreation && !this.isIterationAdded) {
							this.point && this.action.pointUpdated(this.point);
							this.sortDates();
						}
					},
					error: (err) => {
						console.error(
							'Ошибка при создании/редактировании:\n',
							err.message
						);
					},
				})
		);

		this.subscriptions.add(
			this.form.valueChanges
				.pipe(
					startWith(this.form.value),
					distinctUntilChanged(),
					pairwise(),
					// Выключено, чтобы событие не сохранялось, при сохранении итерации
					// tap(([curr, prev]) => {
					// 	this.loading = false;

					// 	if (this.point) {
					// 		if (prev.greenwich !== curr.greenwich) {
					// 			this.point.greenwich =
					// 				this.form.controls['greenwich'].value;
					// 		}
					// 		if (prev.repeatable !== curr.repeatable) {
					// 			// Было так. Но стало работать неправильно.
					// 			// Если снова сломается, решить, какой вариант оставить и доделать
					// 			// this.point.repeatable = !this.point.repeatable;
					// 			this.point.repeatable =
					// 				this.form.controls['repeatable'].value;
					// 			this.switchIteration();
					// 		}
					// 		if (prev.public !== curr.public) {
					// 			this.point.public =
					// 				this.form.controls['public'].value;
					// 		}
					// 		if (prev.color !== curr.color) {
					// 			this.point.color =
					// 				this.form.controls['color'].value;
					// 		}
					// 	}
					// }),
					debounce(() => timer(this._debounceTime))
				)
				.subscribe({
					next: ([curr, prev]) => {
						if (
							prev.difference !== curr.difference ||
							prev.direction !== curr.direction
						) {
							this.differenceChanged();
						}

						/**
						 * Если изменен флаг Гринвича, предупреждаем, что надо сохранить
						 * изменения перед редактированием итераций
						 */
						if (this.notifies['greenwich'].date) {
							if (
								!!this.greenwichValue ===
									!!this.point?.greenwich ||
								!this.hasManyIterations
							) {
								this.notifies['greenwich'].remove();
							}
						} else {
							if (
								!!this.greenwichValue !==
									!!this.point?.greenwich &&
								this.hasManyIterations
							) {
								this.notifies['greenwich'].date =
									this.notify.add({
										title: 'Сохраните событие для корректного редактирования итераций',
									}) as Date;
							}
						}

						/**
						 * Если есть уведомление о повторяемости,
						 * то удаляем его когда оно неактуально.
						 * Если его нет, то показываем, когда актуально
						 */
						if (this.notifies['repeatable'].date) {
							if (
								(!this.isCreation || !this.repeatableValue) &&
								(this.isCreation ||
									this.repeatableValue ||
									!this.hasManyIterations)
							) {
								this.notifies['repeatable'].remove();
							}
						} else {
							if (
								this.repeatableValue &&
								!this.repeatableValueSaved
							) {
								this.notifies['repeatable'].date =
									this.notify.add({
										title: 'Изменение итераций будет доступно после сохранения события',
									}) as Date;
							} else if (
								!this.isCreation &&
								!this.repeatableValue &&
								this.hasManyIterations
							) {
								this.notifies['repeatable'].date =
									this.notify.add({
										title: 'Отключены повторы события',
										text: 'Все итерации кроме последней будут удалены',
									}) as Date;
							}
						}

						this.cdr.detectChanges();
					},
					error: (err) => {
						console.error(
							'Ошибка при изменении в поле формы:\n',
							err.message
						);
					},
				})
		);

		this.subscriptions.add(
			interval(Constants.msInMinute).subscribe({
				next: () => {
					this.dateChanged(this.pointDate);
				},
				error: (err) => {
					console.error('Ошибка при работе таймера:\n', err.message);
				},
			})
		);

		this.subscriptions.add(
			this.data.eventAddPoint$.subscribe({
				next: (point) => {
					this.point = point;
					this.action.pointUpdated(this.point);
					this.success(undefined, 'pointAdded');
				},
			})
		);

		this.subscriptions.add(
			this.data.eventEditPoint$.subscribe({
				next: ([point, editPointEvent]) => {
					this.point = point;
					this.sortDates();
					this.action.pointUpdated(this.point);
					this.success(point, editPointEvent);
					this.cdr.detectChanges();
				},
			})
		);

		this.subscriptions.add(
			this.action.eventUpdatedPoint$.subscribe({
				next: (point) => {
					if (point) {
						this.point = point;
						this.pointDate = point.dates[0].date
							? parseDate(point.dates[0].date)
							: new Date();
						this.form.controls['title'].setValue(point.title);
						this.form.controls['description'].setValue(
							point.description
						);
						this.form.controls['color'].setValue(point.color);
						this.dateChanged();
					}
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
		this.notifies['greenwich'].remove();
		this.notifies['repeatable'].remove();
		this.notifies['timer'].remove();
	}

	get formGroup(): any {
		return this.form;
	}

	get isCreation() {
		return (
			this.type === EditPointType.Create ||
			this.type === EditPointType.CreateUrl
		);
	}

	get isCreationBase() {
		return this.type === EditPointType.Create;
	}

	get isCreationUrl() {
		return this.type === EditPointType.CreateUrl;
	}

	get hasManyIterations() {
		return this.dates?.length && this.dates?.length > 1;
	}

	get isForward() {
		return this.form.controls['direction'].value === 'forward';
	}

	get dates() {
		return this.point?.dates;
	}

	get pointColorNames(): { [key: string]: string } {
		return PointColors;
	}

	get pointColorNamesInverted(): { [key: string]: string } {
		return getInvertedObject(PointColors);
	}

	get pointColors() {
		return Object.keys(PointColors) as PointColorTypes[];
	}

	get pointColor() {
		return this.form.controls['color'].value;
	}

	get pointColorName() {
		return this.pointColorNames[this.pointColor];
	}

	get isBaseFormValid() {
		return this.form.controls['title'].valid;
	}

	get isDateFormValid() {
		return this.form.controls['difference'].valid;
	}

	get differenceValue() {
		return +this.form.controls['difference'].value;
	}

	get pageTitle() {
		return !this.isCreation
			? 'Редактирование'
			: this.isCreationBase
			? 'Создание'
			: 'Создание события-ссылки';
	}

	get visibleDifference() {
		switch (this.differenceMode) {
			case 'hours':
				return Math.round(this.difference / 60);
			case 'days':
				return Math.round(this.difference / (60 * 24));
			case 'weeks':
				return Math.round(this.difference / (60 * 24 * 7));
			case 'months':
				return Math.round(this.difference / (60 * 24 * 30));
			case 'years':
				return Math.round(this.difference / (60 * 24 * 30 * 12));
			default:
				return this.difference;
		}
	}

	get greenwichValue() {
		return this.form.controls['greenwich'].value;
	}

	get publicValue() {
		return this.form.controls['public'].value;
	}

	/**
	 * Если у события изменена многократность, но еще не сохранена.
	 * Влияет на уведомления и возможность создания новых итераций
	 */
	get repeatableValue() {
		return this.form.controls['repeatable'].value;
	}

	/**
	 * Если значение многократности сохранено
	 */
	get repeatableValueSaved() {
		return this.point?.repeatable;
	}

	closeNotify(name: string) {
		this.notifies[name].date &&
			this.notify.close(this.notifies[name].date as Date);
		this.notifies[name].date = undefined;
	}

	sortDates() {
		const sortedDates =
			this.point && setIterationsMode(sortDates(this.point)).dates;

		if (this.point && sortedDates) {
			this.point.dates = sortedDates;
		}
	}

	setValues(
		{
			isReset,
			isFirstLoading,
		}: {
			isReset?: boolean;
			isFirstLoading?: boolean;
		} = {
			isReset: false,
			isFirstLoading: false,
		}
	) {
		(!this.isIterationSwitched || isFirstLoading) &&
			this.form.patchValue(
				{
					title: this.point?.title,
					description: this.point?.description,
					direction: this.point?.direction || 'backward',
					greenwich: this.point?.greenwich || false,
					repeatable:
						this.point?.repeatable ||
						this.isIterationAdded ||
						false,
					public: this.point?.public || false,
					color: this.point?.color || 'gray',
				},
				{
					emitEvent: false,
				}
			);
		if (this.point?.modes) {
			this.form.get('pointModesForm')?.patchValue({
				firstModeTitle: this.point.modes[0].name,
				secondModeTitle: this.point.modes[1].name,
				firstModeEmoji: this.point.modes[0].icon,
				secondModeEmoji: this.point.modes[1].icon,
			});
		}

		const currentPointDate = getPointDate({
			pointDate: isReset
				? new Date()
				: parseDate(
						this.dates?.[this.currentIterationIndex || 0]?.date
				  ),
			isGreenwich: this.isIterationAdded ? false : this.greenwichValue,
		});

		this.pointDate = isDateValid(currentPointDate)
			? currentPointDate
			: new Date();

		this.selectedIterationDate = this.pointDate;

		this.dateChanged(this.pointDate);
	}

	dateChanged(date?: Date) {
		this.difference = this.convertToMinutes(
			+(date || this.pointDate) - +new Date()
		);

		this.setVisibleDifference();
	}

	differenceChanged(diff: number = +this.differenceValue) {
		const currentDate = new Date();
		let diffMs!: number;
		let targetDate!: Date;

		switch (this.differenceMode) {
			case 'hours':
				diffMs = diff * Constants.msInMinute * 60;
				break;
			case 'days':
				diffMs = diff * Constants.msInMinute * 60 * 24;
				break;
			case 'weeks':
				diffMs = diff * Constants.msInMinute * 60 * 24 * 7;
				break;
			case 'months':
				targetDate = addMonths(currentDate, diff);
				break;
			case 'years':
				targetDate = addYears(currentDate, diff);
				break;
			default:
				diffMs = diff * Constants.msInMinute;
				break;
		}

		!targetDate && (targetDate = new Date(currentDate.getTime() + diffMs));
		// Пришлось упростить, когда добавил вывод отрицательных значений
		// const targetDate = this.isForward
		// 	? new Date(currentDate.getTime() - diff * Constants.msInMinute)
		// 	: new Date(currentDate.getTime() + diff * Constants.msInMinute);

		isDateValid(targetDate) && (this.pointDate = targetDate);
	}

	switchIteration(
		i: number = this.currentIterationIndex,
		isSwitched = false
	) {
		const isFirstLoading = !this.currentIterationIndex;
		this.isIterationSwitched = isSwitched;
		this.currentIterationIndex = i;
		this.isIterationAdded = false;
		if (this.isIterationSwitched) {
			this.setValues({
				isFirstLoading,
			});
		}
	}

	switchColor(color: string) {
		this.form.controls['color'].setValue(color);
		this.colorDrop.closeHandler();
	}

	addIterationHandler() {
		this.iterationForm.nativeElement.scrollIntoView({
			behavior: 'smooth',
		});
		this.isIterationAdded = true;
		this.setValues({
			isReset: true,
		});
	}

	differenceModeChanged(value: string | number) {
		this.differenceMode = value as DifferenceMode;
		localStorage.setItem('differenceMode', this.differenceMode);
		this.dateChanged();
	}

	convertToMinutes(ms: number): number {
		return Math.ceil(ms / Constants.msInMinute);
		// Оставил только ceil, когда начал выводить отрицательные значения
		// return Math[this.isForward ? 'trunc' : 'ceil'](
		// 	Math.abs(ms) / Constants.msInMinute
		// );
	}

	getRepeats(repeats: Iteration[]) {
		this.submit(false, repeats);
	}

	setIterationsControls(controls: any) {
		this.iterationControls = controls;
	}

	modeSelected(mode: CalendarMode) {
		this.calendarMode = mode;
	}

	datePicked(date: Date) {
		this.pointDate = date;
		this.dateChanged();
	}

	setVisibleDifference() {
		this.form.controls['difference'].setValue(this.visibleDifference, {
			emitEvent: false,
		});
	}

	switchDateUrlMode(mode: string) {
		this.dateUrlMode = mode as 'date' | 'timer';

		if (this.notifies['timer'].date) {
			if (this.dateUrlMode === 'date') {
				this.notifies['timer'].remove();
			}
		} else {
			this.notifies['timer'].date = this.notify.add({
				title: 'При выборе режима "таймер" отсчёт всегда будет от значения, указанного в ссылке',
				text: 'После обновления страницы отсчёт начнётся заново',
			}) as Date;
		}
	}

	pointModeChanged(modes: PointMode[]) {
		this.pointModes = modes;
		this.modesDrop.closeHandler();
	}

	pointModeClosed() {
		this.pointModes = [];
		this.modesDrop.closeHandler();
	}

	pointModesOpened() {
		from(fetchEmojis('ru'))
			.pipe(combineLatestWith(fetchMessages('ru')), take(1))
			.subscribe({
				next: ([emojis, messages]) => {
					this.emojis = [];
					messages.groups.forEach((item, i) => {
						item.message !== 'компонент' &&
							this.emojis.push({
								title:
									item.message.slice(0, 1).toUpperCase() +
									item.message.slice(1),
								list: emojis.filter(
									(emoji) => emoji.group === i
								),
							});
					});

					this.emojis.push({
						title: 'Прочие',
						list: emojis.filter(
							(emoji) => emoji.group === undefined
						),
					});
				},
			});

		this.isModesDropOpened = true;
	}

	pointModesClosed() {
		this.isModesDropOpened = false;
	}

	submit(saveIteration = false, repeats: Iteration[] = []) {
		if (this.form.invalid) {
			return;
		}

		this.differenceChanged();
		this.loading = true;
		let newDatesArray = [] as Iteration[];

		this.dates?.forEach((item) => {
			const currentItem = {
				date: item.date,
				reason: item.reason,
			} as Iteration;
			item.comment && (currentItem.comment = item.comment);
			newDatesArray.push(currentItem);
		});
		let editPointEvent: EditPointEvent = 'pointEdited';

		const dateTime = format(
			getPointDate({
				pointDate: this.pointDate,
				isGreenwich: this.greenwichValue,
				isInvert: true,
			}),
			Constants.fullDateFormat
		);

		const lastDate = {
			date: dateTime,
			reason: 'byHand',
		} as Iteration;

		if (repeats.length) {
			newDatesArray?.push(...repeats);
			editPointEvent = 'iterationsGenerated';
		} else if (saveIteration) {
			if (!this.repeatableValue || this.isCreation) {
				newDatesArray = [lastDate];
			} else if (this.isIterationAdded) {
				saveIteration && newDatesArray?.push(lastDate);
				editPointEvent = 'iterationAdded';
			} else if (newDatesArray) {
				newDatesArray[this.currentIterationIndex] = lastDate;
				editPointEvent = 'iterationEdited';
			}
		} else if (!this.repeatableValue || this.isCreation) {
			newDatesArray = [lastDate];
		}

		let result = {
			dates: newDatesArray as Iteration[],
		} as Point;

		if (!saveIteration && !repeats.length) {
			result = Object.assign(result, {
				title: this.form.controls['title'].value,
				description: this.form.controls['description'].value || null,
				direction: this.form.controls['direction'].value,
				greenwich: this.greenwichValue,
				repeatable: this.repeatableValue,
				public: this.publicValue,
				user: this.auth.uid || '',
				color: this.form.controls['color'].value || 'gray',
				modes:
					this.pointModes.length && this.repeatableValue
						? this.pointModes
						: null,
			});
		} else {
			result = Object.assign(result, {
				title: this.point?.title,
				description: this.point?.description || '',
				direction: this.point?.direction,
				greenwich: this.point?.greenwich,
				repeatable: this.point?.repeatable,
				public: this.point?.public,
				user: this.point?.user,
				color: this.point?.color || 'gray',
				modes:
					this.point?.modes?.length && this.point?.repeatable
						? this.point.modes
						: null,
			});
			this.isIterationSwitched = true;
		}

		if (this.isCreationBase) {
			this.data.addPoint(result);
		} else if (this.isCreationUrl) {
			const urlParams: any = {
				color:
					result.color !== 'gray' && result.title
						? result.color
						: null,
				title: result.title,
				description: result.description,
				date:
					this.dateUrlMode === 'date'
						? format(
								parseDate(result.dates[0].date),
								Constants.fullDateUrlFormat
						  )
						: null,
			};

			if (this.dateUrlMode === 'timer') {
				this.differenceValue
					? (urlParams[this.differenceMode] = this.differenceValue)
					: (urlParams['minutes'] = 0);
			}

			this.router.navigate(['/url/'], {
				queryParams: urlParams,
			});
		} else if (saveIteration || repeats.length) {
			if (newDatesArray) {
				this.data.editPoint(
					this.point?.id,
					{
						...result,
						repeatable: true,
						dates: newDatesArray,
						id: this.point?.id,
					} as Point,
					editPointEvent,
					lastDate
				);
			}
		} else {
			this.data.editPoint(this.point?.id, {
				...result,
				id: this.point?.id,
			} as Point);
		}
	}

	success(point: Point | undefined, editPointEvent: EditPointEvent) {
		this.loading = false;
		point &&
			(this.point = {
				...this.point,
				...point,
			});
		this.point?.id &&
			this.router
				.navigate(['/edit/' + this.point?.id.toString()], {
					queryParams: {
						iteration: isNaN(this.currentIterationIndex)
							? null
							: this.currentIterationIndex + 1,
					},
				})
				.then(() => {
					editPointEvent &&
						this.notify.add({
							title: EditPointSuccessMessage[editPointEvent],
							short: true,
							view: 'positive',
						});
				});
	}
}
