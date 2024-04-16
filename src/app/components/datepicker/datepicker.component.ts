import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
	format,
	getHours,
	getMinutes,
	getMonth,
	getYear,
	parse,
} from 'date-fns';
import { Constants } from 'src/app/enums';

@Component({
	selector: 'app-datepicker',
	templateUrl: './datepicker.component.html',
})
export class DatepickerComponent implements OnInit {
	@Input() date = new Date();
	@Input() dropClass: string | string[] | null = null;

	dropOpen = false;
	visibleDate = this.date;
	dateYear = '';
	dateMonth = '';

	@Output() datePicked = new EventEmitter<Date>();

	ngOnInit(): void {
		this.visibleDate = this.date;
		this.dateYear = getYear(this.date).toString();
		this.dateMonth = getMonth(this.date).toString();
	}

	get dateFormatted() {
		return format(this.date, Constants.fullDateFormat);
	}

	get dateHour() {
		return getHours(this.date).toString();
	}

	set dateHour(value: string) {
		this.date = parse(value + ':' + this.dateMinute, 'H:m', this.date);
		this.datePicked.emit(this.date);
	}

	get dateMinute() {
		return getMinutes(this.date).toString();
	}

	set dateMinute(value: string) {
		this.date = parse(this.dateHour + ':' + value, 'H:m', this.date);
		this.datePicked.emit(this.date);
	}

	monthChanged() {
		this.visibleDate = parse(
			this.dateYear + '.' + this.dateMonth + '.' + '1',
			'y.M.d',
			new Date()
		);
	}

	dateSelected({ date }: { date: Date }) {
		this.date = parse(this.dateHour + ':' + this.dateMinute, 'H:m', date);
		this.datePicked.emit(this.date);
	}

	visibleDateSelected(date: Date) {
		this.dateYear = getYear(date).toString();
		this.dateMonth = getMonth(date).toString();
	}

	toggleDate() {
		this.dropOpen = !this.dropOpen;
	}
}
