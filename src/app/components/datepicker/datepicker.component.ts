import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
	format,
	getHours,
	getMinutes,
	getMonth,
	getYear,
	parse,
} from 'date-fns';
import { Subject, Subscription, merge } from 'rxjs';
import { Constants } from 'src/app/enums';

@Component({
	selector: 'app-datepicker',
	templateUrl: './datepicker.component.html',
})
export class DatepickerComponent implements OnInit {
	@Input() date = new Date();

	dateForm!: FormGroup;
	dropOpen = false;
	daySelected = this.date;
	visibleDate = this.date;
	private _eventDaySelectedSubject = new Subject<Date>();
	eventDaySelected$ = this._eventDaySelectedSubject.asObservable();
	private subscriptions = new Subscription();

	@Output() datePicked = new EventEmitter<Date>();

	ngOnInit(): void {
		this.daySelected = this.date;
		this.visibleDate = this.date;

		this.dateForm = new FormGroup({
			year: new FormControl(getYear(this.visibleDate)),
			month: new FormControl(getMonth(this.visibleDate)),
			hour: new FormControl(getHours(this.date)),
			minute: new FormControl(getMinutes(this.date)),
		});

		this.subscriptions.add(
			merge(
				this.dateForm.controls['hour'].valueChanges,
				this.dateForm.controls['minute'].valueChanges,
				this.eventDaySelected$
			).subscribe({
				next: () => {
					this.date = parse(
						this.dateForm.controls['hour'].value +
							':' +
							this.dateForm.controls['minute'].value,
						'H:m',
						this.daySelected
					);

					this.datePicked.emit(this.date);
				},
			})
		);

		this.subscriptions.add(
			merge(
				this.dateForm.controls['year'].valueChanges,
				this.dateForm.controls['month'].valueChanges
			).subscribe({
				next: () => {
					this.visibleDate = parse(
						this.dateForm.controls['year'].value +
							'.' +
							this.dateForm.controls['month'].value +
							'.' +
							'1',
						'y.M.d',
						new Date()
					);
					this.dateForm.controls['hour'].value;
				},
			})
		);
	}

	get dateFormatted() {
		return format(this.date, Constants.fullDateFormat);
	}

	dateSelected({ date }: { date: Date }) {
		this.daySelected = date;
		this._eventDaySelectedSubject.next(date);
	}

	visibleDateSelected(date: Date) {
		this.dateForm.patchValue(
			{
				year: date.getFullYear(),
				month: date.getMonth(),
			},
			{
				emitEvent: false,
			}
		);
	}

	toggleDate() {
		this.dropOpen = !this.dropOpen;
	}
}
