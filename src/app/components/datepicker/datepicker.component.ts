import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import {
	addMinutes,
	format,
	getDate,
	getHours,
	getMinutes,
	getMonth,
	getYear,
	isAfter,
	isBefore,
	isSameDay,
	isSameHour,
	isSameYear,
	parse,
	subMinutes,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { IConfig } from 'ngx-mask';
import { Constants } from 'src/app/enums';
import { isDateValid, parseDate } from 'src/app/helpers';
import { SelectArray } from 'src/app/interfaces';
import { DropHorizontal, DropVertical } from 'src/app/types';

@Component({
	selector: 'app-datepicker',
	templateUrl: './datepicker.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerComponent implements OnInit {
	@Input() dropClass: string | string[] | null = null;
	@Input() dateOnly = false;
	@Input() isNow = true;
	@Input() date: Date | undefined = this.isNow ? new Date() : undefined;
	@Input() visibleDate = this.date;
	@Input() vertical: DropVertical = 'auto';
	@Input() horizontal: DropHorizontal = 'right';
	@Input() disabledBefore: Date | undefined;
	@Input() disabledAfter: Date | undefined;

	@Output() datePicked = new EventEmitter<Date>();

	currentYear = getYear(new Date());
	monthPatterns: IConfig['patterns'] = {
		A: {
			pattern: new RegExp('[а-яА-Я0-9]'),
		},
	};

	ngOnInit(): void {
		this.visibleDate = this.fixedDate;
	}

	get defaultDate() {
		return this.date || this.fixedDate || new Date();
	}

	get dateFormatted() {
		return this.date && isDateValid(this.date)
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

	get dateDay() {
		return getDate(this.defaultDate).toString();
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

	get yearsArray(): SelectArray[] {
		return this.createArray({
			length: 200,
			getKey: (index) => this.currentYear - 100 + index,
			isDisabled: (index) =>
				this.isYearDisabled(this.currentYear - 100 + index),
		});
	}

	get monthsArray(): SelectArray[] {
		return this.createArray({
			length: 12,
			getValue: (index) => index,
			getKey: (index) => this.getMonthName(index).toString(),
			isDisabled: (index) => this.isMonthDisabled(index),
		});
	}

	get hoursArray(): SelectArray[] {
		return this.createArray({
			length: 24,
			getKey: (index) => index,
			isDisabled: (index) => this.isHourDisabled(index),
		});
	}

	get minutesArray(): SelectArray[] {
		return this.createArray({
			length: 60,
			getKey: (index) => index,
			isDisabled: (index) => this.isMinuteDisabled(index),
		});
	}

	get isDateDisabledBefore(): boolean {
		const thisDate = this.date || new Date();

		return (
			(thisDate &&
				this.disabledBefore &&
				isBefore(thisDate, this.disabledBefore)) ||
			false
		);
	}

	get isDateDisabledAfter(): boolean {
		const thisDate = this.date || new Date();

		return (
			(thisDate &&
				this.disabledAfter &&
				isAfter(thisDate, this.disabledAfter)) ||
			false
		);
	}

	/**
	 * Возвращает дату, исправленную
	 * с учетом задизейбленных диапазонов
	 */
	get fixedDate(): Date {
		let fixedDateValue = this.date || new Date();
		if (this.isDateDisabledBefore && this.disabledBefore) {
			fixedDateValue =
				this.disabledBefore && addMinutes(this.disabledBefore, 1);
		} else if (this.isDateDisabledAfter && this.disabledAfter) {
			fixedDateValue =
				this.disabledAfter && subMinutes(this.disabledAfter, 1);
		}
		return fixedDateValue;
	}

	public fixDisabledDate() {
		this.date = this.fixedDate;
		this.datePicked.emit(this.date);
	}

	isYearDisabled(index: number): boolean {
		if (!this.date) {
			return false;
		} else {
			const isDisabledBefore =
				this.disabledBefore && index < getYear(this.disabledBefore);
			const isDisabledAfter =
				this.disabledAfter && index > getYear(this.disabledAfter);
			return isDisabledBefore || isDisabledAfter || false;
		}
	}

	isMonthDisabled(index: number): boolean {
		if (!this.date) {
			return false;
		} else {
			const isDisabledBefore =
				this.disabledBefore &&
				isSameYear(this.dateYear, this.disabledBefore) &&
				index < getMonth(this.disabledBefore);
			const isDisabledAfter =
				this.disabledAfter &&
				isSameYear(this.dateYear, this.disabledAfter) &&
				index > getMonth(this.disabledAfter);
			return isDisabledBefore || isDisabledAfter || false;
		}
	}

	isHourDisabled(index: number): boolean {
		if (!this.date) {
			return false;
		} else {
			const isDisabledBefore =
				this.disabledBefore &&
				isSameDay(this.date, this.disabledBefore) &&
				index < getHours(this.disabledBefore);
			const isDisabledAfter =
				this.disabledAfter &&
				isSameDay(this.date, this.disabledAfter) &&
				index > getHours(this.disabledAfter);
			return isDisabledBefore || isDisabledAfter || false;
		}
	}

	isMinuteDisabled(index: number): boolean {
		if (!this.date) {
			return false;
		} else {
			const isDisabledBefore =
				this.disabledBefore &&
				isSameHour(this.date, this.disabledBefore) &&
				index <= getMinutes(this.disabledBefore);
			const isDisabledAfter =
				this.disabledAfter &&
				isSameHour(this.date, this.disabledAfter) &&
				index >= getMinutes(this.disabledAfter);
			return isDisabledBefore || isDisabledAfter || false;
		}
	}

	createArray({
		length,
		getValue,
		getKey,
		isDisabled,
	}: {
		length: number;
		getValue?: (index: number) => number | string;
		getKey: (index: number) => number | string;
		isDisabled?: (index: number) => boolean;
	}): SelectArray[] {
		return Array.from({ length }, (_, index) => ({
			value: getValue ? getValue(index) : getKey(index).toString(),
			key: getKey(index),
			disabled: isDisabled ? isDisabled(index) : false,
		}));
	}

	getMonthName(index: number): string {
		return format(new Date(2000, index), 'LLLL', {
			locale: ru,
		});
	}

	yearSwitched(value: string | number) {
		this.visibleDate = parseDate(
			`${+this.dateMonthNumber + 1}/01/${value} 00:00`
		);
	}

	monthSwitched(value: string | number) {
		this.visibleDate = parseDate(`${+value + 1}/01/${this.dateYear} 00:00`);
	}

	hourSwitched(value: string | number) {
		this.date = parseDate(
			`${+this.dateMonthNumber + 1}/${this.dateDay}/${
				this.dateYear
			} ${value}:${this.dateMinute}`
		);

		this.fixDisabledDate();
	}

	minuteSwitched(value: string | number) {
		this.date = parseDate(
			`${+this.dateMonthNumber + 1}/${this.dateDay}/${this.dateYear} ${
				this.dateHour
			}:${value}`
		);
		this.datePicked.emit(this.date);
	}

	dateSelected({ date }: { date: Date }) {
		this.date = this.dateOnly
			? parse('0:0', 'H:m', date)
			: parse(this.dateHour + ':' + this.dateMinute, 'H:m', date);
		this.visibleDate = this.date;

		this.fixDisabledDate();
	}

	visibleDateSelected(date: Date = this.visibleDate || this.defaultDate) {
		this.dateYear = getYear(date).toString();
		this.dateMonth = getMonth(date).toString();
	}

	filterMonth(item: SelectArray, filterValue: string) {
		return (
			(item.key.toString().includes(filterValue) && !item.disabled) ||
			((+item.value + 1).toString().includes(filterValue) &&
				!item.disabled)
		);
	}
}
