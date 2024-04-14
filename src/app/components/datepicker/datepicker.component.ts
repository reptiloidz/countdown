import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
	dateForm!: FormGroup;
	dropOpen = false;
	daySelected = new Date();
	date = new Date();
	private _eventDaySelectedSubject = new Subject<Date>();
	eventDaySelected$ = this._eventDaySelectedSubject.asObservable();
	private subscriptions = new Subscription();

	@Output() datePicked = new EventEmitter<Date>();

	ngOnInit(): void {
		this.dateForm = new FormGroup({
			year: new FormControl(getYear(new Date())),
			month: new FormControl(getMonth(new Date()) + 1),
			hour: new FormControl(getHours(new Date())),
			minute: new FormControl(getMinutes(new Date())),
		});

		this.subscriptions.add(
			merge(this.dateForm.valueChanges, this.eventDaySelected$).subscribe(
				{
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
				}
			)
		);
	}

	get dateFormatted() {
		return format(this.date, Constants.fullDateFormat);
	}

	dateSelected({ date }: { date: Date }) {
		this.daySelected = date;
		this._eventDaySelectedSubject.next(date);
	}

	toggleDate() {
		this.dropOpen = !this.dropOpen;
	}
}
