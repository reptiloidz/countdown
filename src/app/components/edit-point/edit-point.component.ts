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
} from 'rxjs';
import {
	Point,
	Iteration,
	UserExtraData,
	SwitcherItem,
} from 'src/app/interfaces';
import { DataService, AuthService, ActionService } from 'src/app/services';
import { format } from 'date-fns';
import {
	getPointDate,
	isDateValid,
	parseDate,
	sortDates,
} from 'src/app/helpers';
import { Constants, PointColors } from 'src/app/enums';
import { CalendarMode, EditPointEvent } from 'src/app/types';

export enum EditPointType {
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
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPointComponent implements OnInit, OnDestroy {
	@ViewChild('iterationsList') private iterationsList!: ElementRef;
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
	datePickerValue = this.pointDate;

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

	private _debounceTime = 500;
	private subscriptions = new Subscription();

	checking = new BehaviorSubject<boolean>(true);

	constructor(
		private data: DataService,
		private route: ActivatedRoute,
		private router: Router,
		private auth: AuthService,
		private cdr: ChangeDetectorRef,
		private action: ActionService
	) {}

	ngOnInit(): void {
		this.form = new FormGroup({
			title: new FormControl(null, [Validators.required]),
			description: new FormControl(),
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
				rangePeriod: new FormControl(1, [Validators.required]),
				repeatsMode: new FormControl('setRepeatsAmount', [
					Validators.required,
				]),
				rangeAmount: new FormControl(2, [Validators.required]),
				periodicity: new FormControl('perMinutes', [
					Validators.required,
				]),
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

					this.isCreationUrl &&
						this.form.controls['title'].setValidators(null);
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
							this.point && this.action.pointUpdated(this.point);
							this.sortDates();
						}
					}),
					mergeMap(() => this.auth.getUserData(this.point?.user)),
					mergeMap((userData) => {
						this.userData = userData;
						return this.auth.eventEditAccessCheck$;
					})
				)
				.subscribe({
					next: ({ pointId, access }) => {
						this.point && this.data.putPoint(this.point);
						if (
							access &&
							(pointId === this.point?.id || !pointId)
						) {
							this.checking.next(false);
							this.setValues();
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
					this.dateChanged();
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
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
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

	get isRepeatable() {
		return this.form.controls['repeatable'].value;
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

	get isBaseFormValid() {
		return this.form.controls['title'].valid || this.isCreationUrl;
	}

	get isDateFormValid() {
		return this.form.controls['difference'].valid;
	}

	sortDates() {
		const sortedDates = this.point && sortDates(this.point).dates;
		if (this.point && sortedDates) {
			this.point.dates = sortedDates;
		}
	}

	setValues(isReset = false) {
		!this.isIterationSwitched &&
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

		this.pointDate = getPointDate({
			pointDate: isReset
				? new Date()
				: new Date(
						this.dates?.[this.currentIterationIndex]?.date || ''
				  ),
			isGreenwich: this.isIterationAdded
				? false
				: this.form.controls['greenwich'].value,
		});

		this.pointDate = isDateValid(this.pointDate)
			? this.pointDate
			: new Date();

		this.selectedIterationDate = this.pointDate;

		this.dateChanged(this.pointDate);
	}

	dateChanged(date?: Date) {
		this.difference = this.convertToMinutes(
			+(date || this.datePickerValue) - +new Date()
		);

		this.form.controls['difference'].setValue(this.difference, {
			emitEvent: false,
		});
	}

	differenceChanged() {
		const diff = +this.form.controls['difference'].value;
		const currentDate = new Date();
		const targetDate = new Date(
			currentDate.getTime() + diff * Constants.msInMinute
		);
		// Пришлось упростить, когда добавил вывод отрицательных значений
		// const targetDate = this.isForward
		// 	? new Date(currentDate.getTime() - diff * Constants.msInMinute)
		// 	: new Date(currentDate.getTime() + diff * Constants.msInMinute);

		isDateValid(targetDate) &&
			(this.pointDate = this.datePickerValue = targetDate);
	}

	switchIteration(
		i: number = this.currentIterationIndex,
		isSwitched = false
	) {
		this.isIterationSwitched = isSwitched;
		this.currentIterationIndex = i;
		this.isIterationAdded = false;
		if (this.isIterationSwitched) {
			this.setValues();
		}
	}

	addIterationHandler() {
		this.isIterationAdded = true;
		this.setValues(true);
	}

	get pageTitle() {
		return !this.isCreation
			? 'Редактирование'
			: this.isCreationBase
			? 'Создание'
			: 'Создание события-ссылки';
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
		this.datePickerValue = date;
		this.dateChanged();
	}

	submit(saveIteration = false, repeats: Iteration[] = []) {
		if (this.form.invalid) {
			return;
		}

		this.differenceChanged();
		this.loading = true;
		let newDatesArray = this.dates?.slice(0);
		let editPointEvent: EditPointEvent = 'pointEdited';

		const dateTime = format(
			getPointDate({
				pointDate: this.datePickerValue,
				isGreenwich: this.form.controls['greenwich'].value,
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
			if (!this.isRepeatable || this.isCreation) {
				newDatesArray = [lastDate];
			} else if (this.isIterationAdded) {
				saveIteration && newDatesArray?.push(lastDate);
				editPointEvent = 'iterationAdded';
			} else if (newDatesArray) {
				newDatesArray[this.currentIterationIndex] = lastDate;
				editPointEvent = 'iterationEdited';
			}
		} else if (!this.form.controls['repeatable'].value || this.isCreation) {
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
				greenwich: this.form.controls['greenwich'].value,
				repeatable: this.form.controls['repeatable'].value,
				public: this.form.controls['public'].value,
				user: this.auth.uid || '',
				color: this.form.controls['color'].value,
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
			});
			this.isIterationSwitched = true;
		}

		if (this.isCreationBase) {
			this.data.addPoint(result);
		} else if (this.isCreationUrl) {
			const urlParams = {
				color:
					result.color !== 'gray' && result.title
						? result.color
						: null,
				title: result.title,
				description: result.description,
				date: format(
					parseDate(result.dates[0].date),
					Constants.fullDateUrlFormat
				),
			};

			this.router
				.navigate(['/url/'], {
					queryParams: urlParams,
				})
				.then(() => {
					navigator.clipboard
						.writeText(window.location.href)
						.then(() => {
							alert(
								'URL события успешно скопирован в буфер обмена'
							);
						});
				})
				.catch((err) => {
					console.error('Ошибка при копировании URL:\n', err.message);
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
			this.router.navigate(['/edit/' + this.point?.id.toString()], {
				queryParams: {
					iteration: this.currentIterationIndex + 1,
				},
			});

		editPointEvent && alert(EditPointSuccessMessage[editPointEvent]);
	}
}
