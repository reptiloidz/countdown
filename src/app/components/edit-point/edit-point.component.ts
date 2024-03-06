import {
	Component,
	Input,
	OnInit,
	OnDestroy,
	ChangeDetectionStrategy,
	ViewChild,
	ElementRef,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
	Subscription,
	interval,
	debounce,
	timer,
	filter,
	BehaviorSubject,
	of,
	distinctUntilChanged,
	pairwise,
	tap,
	startWith,
	mergeMap,
} from 'rxjs';
import {
	Point,
	Iteration,
	EditPointEvent,
	CalendarMode,
} from 'src/app/interfaces';
import { DataService, AuthService, ActionService } from 'src/app/services';
import { format, parse } from 'date-fns';
import {
	filterIterations,
	getFirstIteration,
	getPointDate,
	isDateValid,
	sortDates,
} from 'src/app/helpers';
import { Constants } from 'src/app/enums';

export enum EditPointType {
	Create = 'create',
	Edit = 'edit',
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
	@Input() type = EditPointType.Edit;
	form!: FormGroup;
	point: Point | undefined;
	pointDate = new Date();
	difference = 0;
	loading = false;
	validatorDifferenceMaxLength = 8;
	tzOffset = new Date().getTimezoneOffset();
	currentIterationIndex!: number;
	firstIterationIndex = 0;
	removedIterationIndex = 0;
	isIterationAdded = false;
	iterationControls = {};
	iterationsChecked: Number[] = [];
	selectedIterationDate = new Date();
	selectedIterationsNumber = 0;
	calendarMode!: CalendarMode;

	private _debounceTime = 500;
	private subscriptions = new Subscription();
	checking = new BehaviorSubject<boolean>(true);

	constructor(
		private data: DataService,
		private route: ActivatedRoute,
		private router: Router,
		private auth: AuthService,
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
			date: new FormControl(
				format(new Date(), Constants.shortDateFormat),
				[Validators.required]
			),
			time: new FormControl('00:00', [Validators.required]),
			iterationsForm: new FormGroup({
				rangeStartDate: new FormControl(
					format(new Date(), Constants.shortDateFormat),
					[Validators.required]
				),
				rangeStartTime: new FormControl(
					format(new Date(), Constants.timeFormat),
					[Validators.required]
				),
				rangePeriod: new FormControl(1, [Validators.required]),
				repeatsMode: new FormControl('setRepeatsAmount', [
					Validators.required,
				]),
				rangeAmount: new FormControl(2, [Validators.required]),
				periodicity: new FormControl('perMinutes', [
					Validators.required,
				]),
				rangeEndDate: new FormControl(
					format(
						new Date(+new Date() + Constants.msInMinute * 10),
						Constants.shortDateFormat
					),
					[Validators.required]
				),
				rangeEndTime: new FormControl(
					format(
						new Date(+new Date() + Constants.msInMinute * 10),
						Constants.timeFormat
					),
					[Validators.required]
				),
			}),
		});

		this.subscriptions.add(
			this.route.queryParams
				.pipe(
					distinctUntilChanged(),
					tap((data: any) => {
						data.iteration &&
							(this.currentIterationIndex = data.iteration - 1);
						this.isIterationAdded = false;
					}),
					mergeMap(() => this.route.params),
					mergeMap((data: any) => {
						return data['id']
							? this.data.fetchPoint(data['id'])
							: of(undefined);
					}),
					mergeMap((point: Point | undefined) => {
						if (!this.isCreation && !this.isIterationAdded) {
							this.point = point;
							this.sortDates();
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
						}

						return this.auth.eventEditAccessCheck$;
					})
				)
				.subscribe({
					next: ({ pointId, access }) => {
						if (
							access &&
							(pointId === this.point?.id || !pointId)
						) {
							this.checking.next(false);
							this.setValues();
							this.setIterationsParam();
							this.action.iterationSwitched(this.pointDate);
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
					tap(([curr, prev]) => {
						if (this.point) {
							if (prev.greenwich !== curr.greenwich) {
								this.point.greenwich =
									this.form.controls['greenwich'].value;
							}
							if (prev.repeatable !== curr.repeatable) {
								// Было так. Но стало работать неправильно.
								// Если снова сломается, решить, какой вариант оставить и доделать
								// this.point.repeatable = !this.point.repeatable;
								this.point.repeatable =
									this.form.controls['repeatable'].value;
								this.switchIteration();
							}
							if (prev.public !== curr.public) {
								this.point.public =
									this.form.controls['public'].value;
							}
						}
					}),
					debounce(() => timer(this._debounceTime))
				)
				.subscribe({
					next: ([curr, prev]) => {
						if (
							prev.date !== curr.date ||
							prev.time !== curr.time
						) {
							this.dateChanged();
						}
						if (
							prev.difference !== curr.difference ||
							prev.direction !== curr.direction
						) {
							this.differenceChanged();
						}
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
			interval(Constants.msInMinute)
				.pipe(
					filter(() => {
						return this.form.controls['date'].valid;
					})
				)
				.subscribe({
					next: () => {
						this.dateChanged();
					},
					error: (err) => {
						console.error(
							'Ошибка при работе таймера:\n',
							err.message
						);
					},
				})
		);

		this.subscriptions.add(
			this.data.eventAddPoint$.subscribe({
				next: (point) => {
					this.point = point;
					this.success(undefined, 'pointAdded');
				},
			})
		);

		this.subscriptions.add(
			this.data.eventEditPoint$.subscribe({
				next: ([point, editPointEvent]) => {
					this.point = point;
					if (
						this.currentIterationIndex >= this.removedIterationIndex
					) {
						this.currentIterationIndex = point.dates.length - 1;
					}
					this.sortDates();
					this.switchIteration();
					this.setIterationsParam();
					this.success(point, editPointEvent);
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
		return this.type === EditPointType.Create;
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

	sortDates() {
		const sortedDates = this.point && sortDates(this.point).dates;
		if (this.point && sortedDates) {
			this.point.dates = sortedDates;
		}
	}

	setValues(isReset = false) {
		this.form.patchValue(
			{
				title: this.point?.title,
				description: this.point?.description,
				direction: this.point?.direction || 'backward',
				greenwich: this.point?.greenwich || false,
				repeatable: this.point?.repeatable || false,
				public: this.point?.public || false,
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
			tzOffset: this.tzOffset,
			isGreenwich: this.isIterationAdded
				? false
				: this.form.controls['greenwich'].value,
		});

		this.pointDate = isDateValid(this.pointDate)
			? this.pointDate
			: new Date();

		this.selectedIterationDate = this.pointDate;

		this.form.patchValue({
			date: format(this.pointDate, Constants.shortDateFormat),
			time: format(this.pointDate, Constants.timeFormat),
		});

		this.dateChanged(this.pointDate);
	}

	dateChanged(date?: Date) {
		const dateParsed = parse(
			this.form.controls['time'].value,
			Constants.timeFormat,
			parse(
				this.form.controls['date'].value,
				Constants.shortDateFormat,
				new Date()
			)
		);
		this.difference = this.convertToMinutes(
			+(
				date ||
				(isDateValid(dateParsed) &&
					new Date(
						format(
							parse(
								this.form.controls['time'].value,
								Constants.timeFormat,
								parse(
									this.form.controls['date'].value,
									Constants.shortDateFormat,
									new Date()
								)
							),
							Constants.fullDateFormat
						)
					))
			) - +new Date()
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
			this.form.patchValue({
				date: format(targetDate, Constants.shortDateFormat),
				time: format(targetDate, Constants.timeFormat),
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

	addIteration() {
		this.isIterationAdded = true;
		this.setValues(true);
	}

	removeIteration(i: number) {
		let newDatesArray = this.dates?.slice(0);
		newDatesArray && newDatesArray.splice(i, 1);

		confirm('Удалить итерацию?') &&
			(() => {
				this.removedIterationIndex = i;
				this.data.editPoint(
					this.point?.id,
					{
						...this.point,
						dates: newDatesArray,
					} as Point,
					'iterationRemoved'
				);
			})();
	}

	checkIteration() {
		this.iterationsChecked = Array.from(
			this.iterationsList.nativeElement.children
		)
			.filter((item: any) => item.querySelector('input')?.checked)
			.map((item: any) => item.querySelector('input').name);
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
				this.data.editPoint(
					this.point?.id,
					{
						...this.point,
						dates: newDatesArray?.length
							? newDatesArray
							: [this.dates?.[this.dates?.length - 1]],
					} as Point,
					'iterationsRemoved'
				);
			})();
	}

	get isDatesLengthPlural() {
		return this.dates && this.dates?.length > 1;
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

	resetDifference() {
		this.form.controls['difference'].setValue(0);
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

	submit(saveIteration = false, repeats: Iteration[] = []) {
		if (this.form.invalid) {
			return;
		}

		this.differenceChanged();
		this.loading = true;
		let newDatesArray = this.dates?.slice(0);
		let editPointEvent: EditPointEvent = 'pointEdited';

		if (repeats.length) {
			newDatesArray?.push(...repeats);
			editPointEvent = 'iterationsGenerated';
		} else {
			const dateTime = format(
				getPointDate({
					tzOffset: this.tzOffset,
					isGreenwich: this.form.controls['greenwich'].value,
					isInvert: true,
					datePart: this.form.controls['date'].value,
					timePart: this.form.controls['time'].value,
				}),
				Constants.fullDateFormat
			);

			const lastDate = {
				date: dateTime,
				reason: 'byHand',
			} as Iteration;

			if (!this.isRepeatable || this.isCreation) {
				newDatesArray = [lastDate];
			} else if (this.isIterationAdded) {
				saveIteration && newDatesArray?.push(lastDate);
				editPointEvent = 'iterationAdded';
			} else if (newDatesArray) {
				newDatesArray[this.currentIterationIndex] = lastDate;
				editPointEvent = 'iterationEdited';
			}
		}

		const result = {
			title: this.form.controls['title'].value,
			description: this.form.controls['description'].value || null,
			direction: this.form.controls['direction'].value,
			greenwich: this.form.controls['greenwich'].value,
			repeatable: this.form.controls['repeatable'].value,
			public: this.form.controls['public'].value,
			dates: newDatesArray as Iteration[],
			user: this.auth.uid || '',
		};

		if (this.isCreation) {
			this.data.addPoint(result);
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
					editPointEvent
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
