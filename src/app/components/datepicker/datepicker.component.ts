import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
	format,
	getHours,
	getMinutes,
	getMonth,
	getYear,
	parse,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { Constants } from 'src/app/enums';
import { parseDate } from 'src/app/helpers';
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
			value + '.' + (this.dateMonthNumber + 1) + '.' + '1',
			'y.M.d',
			this.defaultDate
		);
	}

	get dateMonth() {
		return this.getMonthName(this.dateMonthNumber);
	}

	get dateMonthNumber() {
		return getMonth(this.visibleDate || this.defaultDate);
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

	get yearsArray(): Record<number, number | string> {
		return this.createArray(200, (index) => this.currentYear - 100 + index);
	}

	get monthsArray(): Record<number, number | string> {
		return this.createArray(
			12,
			(index) => this.getMonthName(index),
			(index) => index
		);
	}

	get hoursArray(): Record<number, number | string> {
		return this.createArray(24, (index) => index);
	}

	get minutesArray(): Record<number, number | string> {
		return this.createArray(60, (index) => index);
	}

	private createArray(
		length: number,
		getValue: (index: number) => number | string,
		getKey?: (index: number) => number | string
	): Record<number, number | string> {
		return Array.from({ length }, (_, index) => ({
			[getValue(index)]: getKey ? getKey(index) : getValue(index),
		})).reduce((acc, obj) => ({ ...acc, ...obj }), {});
	}

	getMonthName(index: number): string {
		return format(new Date(2000, index), 'LLLL', {
			locale: ru,
		});
	}

	yearSwitched(value: string | number) {
		this.visibleDate = parseDate(
			`${+this.dateMonthNumber}/01/${value} 00:00`
		);
	}

	monthSwitched(value: string | number) {
		this.visibleDate = parseDate(`${+value + 1}/01/${this.dateYear} 00:00`);
	}

	dateTimeChanged(value: string | number) {
		// console.log(value);
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

	filterMonth(item: [string, string | number], filterValue: string) {
		return (
			item[0].includes(filterValue) ||
			(+item[1] + 1).toString().includes(filterValue)
		);
	}
}
