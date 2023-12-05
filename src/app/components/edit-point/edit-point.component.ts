import {
	Component,
	Input,
	OnInit,
	OnDestroy,
	ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
	Subscription,
	switchMap,
	interval,
	EMPTY,
	debounce,
	timer,
	filter,
	BehaviorSubject,
} from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { DataService } from 'src/app/services/data.service';
import { format, parse } from 'date-fns';
import { getPointDate } from 'src/app/helpers';
import { Constants } from 'src/app/enums';
import { Iteration } from 'src/app/interfaces/iteration.interface';
import { SortPipe } from 'src/app/pipes/sort.pipe';
import { AuthService } from 'src/app/services/auth.service';

export enum EditPointType {
	Create = 'create',
	Edit = 'edit',
}

@Component({
	selector: 'app-edit-point',
	templateUrl: './edit-point.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPointComponent implements OnInit, OnDestroy {
	@Input() type = EditPointType.Edit;
	form!: FormGroup;
	point: Point | undefined;
	difference = 0;
	loading = false;
	validatorDifferenceMaxLength = 8;
	tzOffset = new Date().getTimezoneOffset();
	currentIterationIndex = new BehaviorSubject<number>(0);
	removedIterationIndex = 0;
	isIterationAdded = false;
	iterationControls = {};

	private _debounceTime = 500;
	private subscriptions = new Subscription();
	checking = new BehaviorSubject<boolean>(true);

	constructor(
		private data: DataService,
		private route: ActivatedRoute,
		private router: Router,
		private sortPipe: SortPipe,
		private auth: AuthService
	) {}

	ngOnInit(): void {
		this.form = new FormGroup({
			title: new FormControl(null, [Validators.required]),
			description: new FormControl(),
			difference: new FormControl(this.difference, [
				Validators.required,
				Validators.pattern(
					`^[0-9]{1,${this.validatorDifferenceMaxLength}}$`
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
			this.route.params
				.pipe(
					switchMap((data: any) => {
						return data['id']
							? this.data.fetchPoint(data['id'])
							: EMPTY;
					}),
					switchMap((point: Point | undefined) => {
						if (!this.isCreation && !this.isIterationAdded) {
							this.point = point;
							this.sortDates();
							this.switchIteration(
								this.point?.dates.length
									? this.point.dates.length - 1
									: 0
							);
						}

						return this.auth.eventEditAccessCheck$;
					})
				)
				.subscribe({
					next: ({ pointId, access }) => {
						if (access && pointId === this.point?.id) {
							this.checking.next(false);
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
			this.form.controls['date'].valueChanges
				.pipe(debounce(() => timer(this._debounceTime)))
				.subscribe({
					next: () => {
						this.dateChanged();
					},
					error: (err) => {
						console.error(
							'Ошибка при изменении даты:\n',
							err.message
						);
					},
				})
		);

		this.subscriptions.add(
			this.form.controls['time'].valueChanges
				.pipe(debounce(() => timer(this._debounceTime)))
				.subscribe({
					next: () => {
						this.dateChanged();
					},
					error: (err) => {
						console.error(
							'Ошибка при изменении времени:\n',
							err.message
						);
					},
				})
		);

		this.subscriptions.add(
			this.form.controls['difference'].valueChanges
				.pipe(debounce(() => timer(this._debounceTime)))
				.subscribe({
					next: () => {
						this.differenceChanged();
					},
					error: (err) => {
						console.error(
							'Ошибка при изменении таймера:\n',
							err.message
						);
					},
				})
		);

		this.subscriptions.add(
			this.form.controls['direction'].valueChanges.subscribe({
				next: () => {
					this.differenceChanged();
				},
				error: (err) => {
					console.error(
						'Ошибка при изменении направления:\n',
						err.message
					);
				},
			})
		);

		this.subscriptions.add(
			this.form.controls['greenwich'].valueChanges.subscribe({
				next: () => {
					if (this.point) {
						this.point.greenwich =
							this.form.controls['greenwich'].value;
					}
				},
				error: (err) => {
					console.error(
						'Ошибка при переключении часового пояса:\n',
						err.message
					);
				},
			})
		);

		this.subscriptions.add(
			this.form.controls['repeatable'].valueChanges.subscribe({
				next: () => {
					if (this.point) {
						this.point.repeatable = !this.point.repeatable;
						this.switchIteration();
					}
				},
				error: (err) => {
					console.error(
						'Ошибка при переключении повторяемости:\n',
						err.message
					);
				},
			})
		);

		this.subscriptions.add(
			this.form.controls['public'].valueChanges.subscribe({
				next: () => {
					if (this.point) {
						this.point.public = this.form.controls['public'].value;
					}
				},
				error: (err) => {
					console.error(
						'Ошибка при переключении публичности:\n',
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
					this.success();
				},
				error: (err) => {
					console.error(
						'Ошибка при создании события:\n',
						err.message
					);
				},
			})
		);

		this.subscriptions.add(
			this.data.eventEditPoint$.subscribe({
				next: (point) => {
					this.sortDates();
					this.switchIteration();
					this.success(point);
				},
				error: (err) => {
					console.error(
						'Ошибка при редактировании события:\n',
						err.message
					);
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
		return this.point?.dates.length && this.point?.dates.length > 1;
	}

	get isForward() {
		return this.form.controls['direction'].value === 'forward';
	}

	sortDates() {
		const sortedDates = this.sortPipe.transform(this.point?.dates);
		if (this.point && sortedDates) {
			this.point.dates = sortedDates;
		}
	}

	setValues(isReset = false) {
		this.form.patchValue(
			{
				title: this.point?.title,
				description: this.point?.description,
				direction: this.point?.direction,
				greenwich: this.point?.greenwich || false,
				repeatable: this.point?.repeatable || false,
				public: this.point?.public || false,
			},
			{
				emitEvent: false,
			}
		);

		const pointDate = getPointDate(
			isReset
				? new Date()
				: new Date(
						this.point?.dates[this.currentIterationIndex.getValue()]
							?.date || ''
				  ),
			this.tzOffset,
			this.isIterationAdded
				? false
				: this.form.controls['greenwich'].value
		);
		this.form.patchValue({
			date: format(pointDate, Constants.shortDateFormat),
			time: format(pointDate, Constants.timeFormat),
		});

		this.dateChanged(pointDate);
	}

	dateChanged(date?: Date) {
		this.difference = this.convertToMinutes(
			+(
				date ||
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
				)
			) - +new Date()
		);
		this.form.controls['difference'].setValue(this.difference, {
			emitEvent: false,
		});
	}

	differenceChanged() {
		const diff = +this.form.controls['difference'].value;
		const currentDate = new Date();
		const targetDate = this.isForward
			? new Date(currentDate.getTime() - diff * Constants.msInMinute)
			: new Date(currentDate.getTime() + diff * Constants.msInMinute);

		this.form.patchValue({
			date: format(targetDate, Constants.shortDateFormat),
			time: format(targetDate, Constants.timeFormat),
		});
	}

	switchIteration(i = (this.point?.dates.length || 1) - 1) {
		this.currentIterationIndex.next(i);
		this.isIterationAdded = false;
		this.setValues();
	}

	addIteration() {
		this.isIterationAdded = true;
		this.setValues(true);
	}

	removeIteration(i: number) {
		let newDatesArray = this.point?.dates;
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

	convertToMinutes(ms: number): number {
		return Math[this.isForward ? 'trunc' : 'ceil'](
			Math.abs(ms) / Constants.msInMinute
		);
	}

	getRepeats(repeats: Iteration[]) {
		this.submit(false, repeats);
	}

	setIterationsControls(controls: any) {
		this.iterationControls = controls;
	}

	submit(saveIteration = false, repeats: Iteration[] = []) {
		if (this.form.invalid) {
			return;
		}

		this.differenceChanged();
		this.loading = true;
		let newDatesArray = this.point?.dates;

		if (repeats.length) {
			newDatesArray?.push(...repeats);
		} else {
			const date = parse(
				this.form.controls['date'].value,
				Constants.shortDateFormat,
				getPointDate(
					new Date(),
					this.tzOffset,
					this.form.controls['greenwich'].value,
					true
				)
			);
			const dateTime = format(
				getPointDate(
					parse(
						this.form.controls['time'].value,
						Constants.timeFormat,
						date
					),
					this.tzOffset,
					this.form.controls['greenwich'].value,
					true
				),
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
			} else if (newDatesArray) {
				newDatesArray[this.currentIterationIndex.getValue()] = lastDate;
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
				this.data.editPoint(this.point?.id, {
					...result,
					repeatable: true,
					dates: newDatesArray,
					id: this.point?.id,
				} as Point);
			}
		} else {
			this.data.editPoint(this.point?.id, {
				...result,
				id: this.point?.id,
			} as Point);
		}
	}

	success(point?: Point) {
		this.loading = false;
		point &&
			(this.point = {
				...this.point,
				...point,
			});
		this.point?.id &&
			this.router.navigate(['/edit/' + this.point?.id.toString()]);
		alert('Успешно');
	}
}
