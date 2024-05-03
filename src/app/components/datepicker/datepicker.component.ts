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
	@Input() dropClass: string | string[] | null = null;
	@Input() dateOnly = false;
	@Input() isNow = true;
	@Input() date: Date | undefined = this.isNow ? new Date() : undefined;
	@Input() visibleDate = this.date;

	dropOpen = false;

	@Output() datePicked = new EventEmitter<Date>();

	ngOnInit(): void {
		this.visibleDate = this.date;
	}

	get defaultDate() {
		return this.date || new Date();
	}

	get dateFormatted() {
		return this.date
			? format(
					this.date,
					this.dateOnly
						? Constants.shortDateFormat
						: Constants.fullDateFormat
			  )
			: 'Выберите дату';
	}

	get dateYear() {
		return getYear(this.visibleDate || this.defaultDate).toString();
	}

	set dateYear(value: string) {
		this.visibleDate = parse(
			value + '.' + (+this.dateMonth + 1) + '.' + '1',
			'y.M.d',
			this.defaultDate
		);
	}

	get dateMonth() {
		return getMonth(this.visibleDate || this.defaultDate).toString();
	}

	set dateMonth(value: string) {
		this.visibleDate = parse(
			this.dateYear + '.' + (+value + 1) + '.' + '1',
			'y.M.d',
			this.defaultDate
		);
	}

	get dateHour() {
		return getHours(this.defaultDate).toString();
	}

	set dateHour(value: string) {
		this.date = parse(
			value + ':' + this.dateMinute,
			'H:m',
			this.defaultDate
		);
		this.datePicked.emit(this.date);
	}

	get dateMinute() {
		return getMinutes(this.defaultDate).toString();
	}

	set dateMinute(value: string) {
		this.date = parse(this.dateHour + ':' + value, 'H:m', this.defaultDate);
		this.datePicked.emit(this.date);
	}

	get yearsArray() {
		return [].constructor(200);
	}

	get monthsArray() {
		return [].constructor(12);
	}

	get hoursArray() {
		return [].constructor(24);
	}

	get minutesArray() {
		return [].constructor(60);
	}

	dateSelected({ date }: { date: Date }) {
		this.date = this.dateOnly
			? parse('0:0', 'H:m', date)
			: parse(this.dateHour + ':' + this.dateMinute, 'H:m', date);
		this.visibleDate = this.date;
		this.datePicked.emit(this.date);
	}

	visibleDateSelected(date: Date = this.visibleDate || this.defaultDate) {
		this.dateYear = getYear(date).toString();
		this.dateMonth = getMonth(date).toString();
	}

	toggleDate() {
		this.dropOpen = !this.dropOpen;
	}
}
