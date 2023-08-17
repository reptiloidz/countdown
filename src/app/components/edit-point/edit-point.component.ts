import {
	Component,
	Input,
	OnInit,
	OnDestroy,
	ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, switchMap, interval, EMPTY } from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { DataService } from 'src/app/services/data.service';
import { format, parse } from 'date-fns';

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
	private _minute = 60000;
	private subscriptions: Subscription = new Subscription();

	constructor(
		private data: DataService,
		private route: ActivatedRoute,
		private router: Router
	) {}

	ngOnInit(): void {
		this.form = new FormGroup({
			title: new FormControl(null, [Validators.required]),
			description: new FormControl(null, [Validators.required]),
			difference: new FormControl(this.difference, [Validators.required]),
			direction: new FormControl(null, [Validators.required]),
			date: new FormControl(null, [Validators.required]),
			time: new FormControl('00:00', [Validators.required]),
		});

		this.subscriptions.add(
			this.route.params
				.pipe(
					switchMap((data: any) => {
						return data['id']
							? this.data.getPointData(data['id'])
							: EMPTY;
					})
				)
				.subscribe({
					next: (point: Point | undefined) => {
						if (!this.isCreation) {
							this.point = point;
							this.setValues();
						}
					},
					error(err) {
						console.log('Ошибка при редактировании:', err);
					},
				})
		);

		this.subscriptions.add(
			this.form.controls['date'].valueChanges.subscribe({
				next: () => {
					this.dateChanged();
				},
			})
		);

		this.subscriptions.add(
			this.form.controls['time'].valueChanges.subscribe({
				next: () => {
					this.dateChanged();
				},
			})
		);

		this.subscriptions.add(
			this.form.controls['difference'].valueChanges.subscribe({
				next: () => {
					this.differenceChanged();
				},
			})
		);

		this.subscriptions.add(
			this.form.controls['direction'].valueChanges.subscribe({
				next: () => {
					this.differenceChanged();
				},
			})
		);

		this.subscriptions.add(
			interval(this._minute).subscribe({
				next: () => {
					this.dateChanged();
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get isCreation() {
		return this.type === EditPointType.Create;
	}

	setValues() {
		this.form.patchValue({
			title: this.point?.title,
			description: this.point?.description,
			direction: this.point?.direction,
		});

		const pointDate = this.point?.date
			? new Date(this.point.date)
			: new Date();
		this.form.patchValue({
			date: format(pointDate, 'yyyy-MM-dd'),
			time: format(pointDate, 'HH:mm'),
		});

		this.dateChanged(pointDate);
	}

	dateChanged(date?: Date) {
		this.difference = this.convertToMinutes(
			+(
				date ||
				new Date(
					this.form.controls['date'].value +
						' ' +
						this.form.controls['time'].value
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
			? new Date(currentDate.getTime() + diff * this._minute)
			: new Date(currentDate.getTime() - diff * this._minute);

		this.form.patchValue({
			date: format(targetDate, 'yyyy-MM-dd'),
			time: format(targetDate, 'HH:mm'),
		});
	}

	convertToMinutes(ms: number): number {
		return Math.round(Math.abs(ms) / this._minute);
	}

	get isForward() {
		return this.form.controls['direction'].value === 'forward';
	}

	submit() {
		const date = parse(
			this.form.controls['date'].value,
			'yyyy-MM-dd',
			new Date()
		);
		const dateTime = format(
			parse(this.form.controls['time'].value, 'HH:mm', date),
			'MM.dd.yyyy HH:mm'
		);
		const result = {
			title: this.form.controls['title'].value,
			description: this.form.controls['description'].value,
			direction: this.form.controls['direction'].value,
			difference: this.form.controls['difference'].value,
			date: dateTime,
		};

		if (this.isCreation) {
			this.point = {
				...result,
				id: new Date().getTime().toString(),
			};
			this.data.addPointData(this.point);
			this.subscriptions.add(
				this.data.eventAddPoint$.subscribe({
					next: (point) => {
						this.success(point);
					},
				})
			);
		} else {
			this.data.editPointData(this.point?.id, {
				...result,
				id: this.point?.id,
			} as Point);
			this.subscriptions.add(
				this.data.eventEditPoint$.subscribe({
					next: (point) => {
						this.success(point);
					},
				})
			);
		}
	}

	success(point: Point) {
		this.router.navigate(['/point/' + this.point?.id.toString()]);
		alert('Успешно');
	}
}
