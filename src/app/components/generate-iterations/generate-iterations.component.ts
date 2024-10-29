import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
	differenceInDays,
	differenceInWeeks,
	endOfMonth,
	format,
	getWeekOfMonth,
	startOfMonth,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { Constants } from 'src/app/enums';
import { getPointDate, parseDate } from 'src/app/helpers';
import { Iteration, SelectArray, SwitcherItem } from 'src/app/interfaces';

@Component({
	selector: 'app-generate-iterations',
	templateUrl: './generate-iterations.component.html',
})
export class GenerateIterationsComponent implements OnInit {
	@Input() form!: FormGroup;
	@Input() loading = false;
	@Output() repeatsAreGenerated = new EventEmitter<Iteration[]>();

	rangeStartDate = new Date();
	rangeEndDate = new Date(+new Date() + Constants.msInMinute * 10);
	repeats: Iteration[] = [];

	periodicityList: SelectArray[] = [
		{
			key: 'Минут',
			value: 'perMinutes',
		},
		{
			key: 'Часов',
			value: 'perHours',
		},
		{
			key: 'Дней',
			value: 'perDays',
		},
		{
			key: 'Недель',
			value: 'perWeeks',
		},
		{
			key: 'Месяцев',
			value: 'perMonths',
		},
		{
			key: 'Лет',
			value: 'perYears',
		},
	];

	repeatsModeList: SwitcherItem[] = [
		{
			text: 'Число повторов',
			value: 'setRepeatsAmount',
			icon: 'refresh',
		},
		{
			text: 'Конец диапазона',
			value: 'setRangeEnd',
			icon: 'calendar-clock',
		},
	];

	ngOnInit(): void {
		this.getStartDayParam();
	}

	get iterationsForm() {
		return this.form.get('iterationsForm') as FormGroup;
	}

	get isRepeatsAmountSet() {
		return (
			this.iterationsForm.controls['repeatsMode'].value ===
			'setRepeatsAmount'
		);
	}

	get periodicityValue() {
		let periodicity = 0;

		switch (this.iterationsForm.controls['periodicity'].value) {
			case 'perMinutes':
				periodicity = Constants.msInMinute;
				break;

			case 'perHours':
				periodicity = Constants.msInMinute * 60;
				break;

			case 'perDays':
				periodicity = Constants.msInMinute * 60 * 24;
				break;

			case 'perWeeks':
				periodicity = Constants.msInMinute * 60 * 24 * 7;
				break;

			case 'perMonths':
				periodicity = Constants.msInMinute * 60 * 24 * 30;
				break;

			case 'perYears':
				periodicity = Constants.msInMinute * 60 * 24 * 30 * 12;
				break;

			default:
				periodicity = Constants.msInMinute;
				break;
		}

		return periodicity * this.iterationsForm.controls['rangePeriod'].value;
	}

	get dayWeekNumber(): number {
		return (
			getWeekOfMonth(this.rangeStartDate, {
				weekStartsOn: 1,
			}) - (this.wasSameWeekdayInFirstWeek ? 1 : 0)
		);
	}

	get dayFullWeekNumber(): number {
		return (
			differenceInWeeks(
				this.rangeStartDate,
				startOfMonth(this.rangeStartDate)
			) + (this.wasSameWeekdayInFirstWeek ? 1 : 0)
		);
	}

	get lastDayWeek(): boolean {
		return !differenceInWeeks(
			this.rangeStartDate,
			endOfMonth(this.rangeStartDate)
		);
	}

	get lastDayOfMonth(): boolean {
		return (
			differenceInDays(
				endOfMonth(this.rangeStartDate),
				this.rangeStartDate
			) === 0
		);
	}

	get secondFromTheEndDayMonth(): boolean {
		return (
			differenceInDays(
				endOfMonth(this.rangeStartDate),
				this.rangeStartDate
			) === 1
		);
	}

	get thirdFromTheEndDayMonth(): boolean {
		return (
			differenceInDays(
				endOfMonth(this.rangeStartDate),
				this.rangeStartDate
			) === 2
		);
	}

	get wasSameWeekdayInFirstWeek(): boolean {
		return (
			getWeekOfMonth(this.rangeStartDate, {
				weekStartsOn: 1,
			}) -
				differenceInWeeks(
					this.rangeStartDate,
					startOfMonth(this.rangeStartDate)
				) >
			1
		);
	}

	genRepeats() {
		if (this.isRepeatsAmountSet) {
			for (
				let i = 0;
				i < this.iterationsForm.controls['rangeAmount'].value;
				i++
			) {
				this.repeats.push({
					date: this.getDateTime(i),
					reason: 'frequency',
				});
			}
		} else {
			this.addIterationRecursively(0);
		}

		this.repeatsAreGenerated.emit(this.repeats);

		this.repeats = [];
	}

	getDateTime(k: number) {
		return format(
			getPointDate({
				pointDate: new Date(
					+getPointDate({
						pointDate: this.rangeStartDate,
						isGreenwich: this.form.controls['greenwich'].value,
						isInvert: true,
					}) +
						this.periodicityValue * k
				),
				isGreenwich: this.form.controls['greenwich'].value,
				isInvert: true,
			}),
			Constants.fullDateFormat
		);
	}

	rangeStartDatePicked(date: Date) {
		this.rangeStartDate = date;
		this.getStartDayParam();
	}

	rangeEndDatePicked(date: Date) {
		this.rangeEndDate = date;
	}

	getStartDayParam() {
		console.log(
			`${format(this.rangeStartDate, 'EEEE', {
				locale: ru,
			})} номер ${this.dayWeekNumber}`
		);
		this.dayFullWeekNumber &&
			console.log(
				`${format(this.rangeStartDate, 'EEEE', {
					locale: ru,
				})} номер ${this.dayFullWeekNumber} (целые недели)`
			);
		this.lastDayWeek &&
			console.log(
				`Последний ${format(this.rangeStartDate, 'EEEE', {
					locale: ru,
				})} недели`
			);
		this.lastDayOfMonth && console.log('Последний день месяца');
		this.secondFromTheEndDayMonth &&
			console.log('Предпоследний день месяца');
		this.thirdFromTheEndDayMonth &&
			console.log('Третий с конца день месяца');
	}

	addIterationRecursively(k: number) {
		const currentDateTime = this.getDateTime(k);

		const dateTime = getPointDate({
			pointDate: this.rangeEndDate,
			isGreenwich: this.form.controls['greenwich'].value,
			isInvert: true,
		});

		if (parseDate(currentDateTime) <= dateTime) {
			this.repeats.push({
				date: currentDateTime,
				reason: 'frequency',
			});
			this.addIterationRecursively(k + 1);
		}
	}
}
