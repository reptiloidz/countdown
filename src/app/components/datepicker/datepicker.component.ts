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
import { DropHorizontal, DropVertical } from 'src/app/types';

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
	@Input() vertical: DropVertical = 'auto';
	@Input() horizontal: DropHorizontal = 'right';

	@Output() datePicked = new EventEmitter<Date>();

	currentYear = getYear(new Date());

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
		return (getMonth(this.visibleDate || this.defaultDate) + 1).toString();
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

	get yearsArray(): Record<number, number> {
		return this.createArray(200, (index) => this.currentYear - 100 + index);
	}

	get monthsArray(): Record<number, number> {
		return this.createArray(12, (index) => index + 1);
	}

	get hoursArray(): Record<number, number> {
		return this.createArray(24, (index) => index);
	}

	get minutesArray(): Record<number, number> {
		return this.createArray(60, (index) => index);
	}

	private createArray(
		length: number,
		getValue: (index: number) => number
	): Record<number, number> {
		return Array.from({ length }, (_, index) => ({
			[index]: getValue(index),
		})).reduce((acc, obj) => ({ ...acc, ...obj }), {});
	}

	dateTimeChanged(value: string | number) {
		console.log(value);
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
}
