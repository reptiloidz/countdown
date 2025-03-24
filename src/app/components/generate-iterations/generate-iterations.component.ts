import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
	Day,
	addDays,
	addHours,
	addMinutes,
	addMonths,
	addWeeks,
	addYears,
	differenceInDays,
	differenceInWeeks,
	endOfMonth,
	endOfWeek,
	format,
	getDate,
	getDay,
	getHours,
	getMinutes,
	getWeekOfMonth,
	isMonday,
	lastDayOfMonth,
	nextDay,
	previousDay,
	startOfDay,
	startOfMonth,
	subDays,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { Constants } from 'src/app/enums';
import { getPointDate, parseDate } from 'src/app/helpers';
import { Iteration, Point, RadioItem, SelectArray, SwitcherItem } from 'src/app/interfaces';
import { DatepickerComponent } from '../datepicker/datepicker.component';

@Component({
	selector: 'app-generate-iterations',
	templateUrl: './generate-iterations.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateIterationsComponent implements OnInit {
	@Input() form!: FormGroup;
	@Input() loading = false;
	@Input() point: Point | undefined;
	@Output() repeatsAreGenerated = new EventEmitter<Iteration[]>();
	@ViewChild('rangeEndRef', { static: false }) rangeEndRef!: DatepickerComponent;

	rangeStartDate = new Date();
	rangeEndDate = addMinutes(this.rangeStartDate, 10);
	repeats: Iteration[] = [];
	monthOptions: RadioItem[] = [];

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

	constructor(private cdr: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.getStartDayParam();
	}

	get iterationsForm() {
		return this.form.get('iterationsForm') as FormGroup;
	}

	get isRepeatsAmountSet() {
		return this.iterationsForm.controls['repeatsMode'].value === 'setRepeatsAmount';
	}

	get rangeAmountValue() {
		return this.iterationsForm.controls['rangeAmount'].value;
	}

	get rangePeriodValue() {
		return this.iterationsForm.controls['rangePeriod'].value;
	}

	get periodicityModeValue() {
		return this.iterationsForm.controls['periodicity'].value;
	}

	get monthOptionsValue() {
		return this.iterationsForm.controls['monthOptions'].value;
	}

	get periodicityValue() {
		let periodicity = 0;

		switch (this.periodicityModeValue) {
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

			default:
				periodicity = Constants.msInMinute;
				break;
		}

		return periodicity * this.rangePeriodValue;
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
			differenceInWeeks(this.rangeStartDate, startOfMonth(this.rangeStartDate)) +
			(this.wasSameWeekdayInFirstWeek ? 1 : 0)
		);
	}

	get lastDayWeek(): boolean {
		return !differenceInWeeks(this.rangeStartDate, endOfMonth(this.rangeStartDate));
	}

	get lastDayOfMonth(): boolean {
		return differenceInDays(endOfMonth(this.rangeStartDate), this.rangeStartDate) === 0;
	}

	get secondFromTheEndDayMonth(): boolean {
		return differenceInDays(endOfMonth(this.rangeStartDate), this.rangeStartDate) === 1;
	}

	get thirdFromTheEndDayMonth(): boolean {
		return differenceInDays(endOfMonth(this.rangeStartDate), this.rangeStartDate) === 2;
	}

	get wasSameWeekdayInFirstWeek(): boolean {
		return (
			getWeekOfMonth(this.rangeStartDate, {
				weekStartsOn: 1,
			}) -
				differenceInWeeks(this.rangeStartDate, startOfMonth(this.rangeStartDate)) >
			1
		);
	}

	getStartDayParam() {
		let startDayParams: RadioItem[] = [];
		let dayNumberSelected = false;

		if (!this.lastDayOfMonth && !this.secondFromTheEndDayMonth && !this.thirdFromTheEndDayMonth) {
			startDayParams.push({
				text: `${getDate(this.rangeStartDate)}-е число месяца`,
				value: 'dayOfMonth',
				checked: true,
			});

			dayNumberSelected = true;
		}

		this.lastDayOfMonth &&
			startDayParams.push({
				text: 'Последний день месяца',
				value: 'lastDayOfMonth',
				checked: !dayNumberSelected,
			}) &&
			(dayNumberSelected = true);

		this.secondFromTheEndDayMonth &&
			startDayParams.push({
				text: 'Предпоследний день месяца',
				value: 'secondFromTheEndDayMonth',
				checked: !dayNumberSelected,
			}) &&
			(dayNumberSelected = true);

		this.thirdFromTheEndDayMonth &&
			startDayParams.push({
				text: '3-й с конца день месяца',
				value: 'thirdFromTheEndDayMonth',
				checked: !dayNumberSelected,
			}) &&
			(dayNumberSelected = true);

		this.dayWeekNumber &&
			this.dayWeekNumber < 5 &&
			startDayParams.push({
				text: `${this.dayWeekNumber}-${this.getEnding(getDay(this.rangeStartDate), true)} ${format(
					this.rangeStartDate,
					'EEEE',
					{
						locale: ru,
					},
				)}`,
				value: 'dayWeekNumber',
			});

		this.dayFullWeekNumber &&
			this.dayFullWeekNumber < 5 &&
			!isMonday(startOfMonth(this.rangeStartDate)) &&
			startDayParams.push({
				text: `${this.dayFullWeekNumber}-${this.getEnding(getDay(this.rangeStartDate), true)} ${format(
					this.rangeStartDate,
					'EEEE',
					{
						locale: ru,
					},
				)} (считая с первой полной недели)`,
				value: 'dayFullWeekNumber',
			});

		this.lastDayWeek &&
			startDayParams.push({
				text: `Последн${this.getEnding(getDay(this.rangeStartDate))} ${format(this.rangeStartDate, 'EEEE', {
					locale: ru,
				})} месяца`,
				value: 'lastDayWeek',
			});

		this.monthOptions = startDayParams;
		this.iterationsForm.controls['monthOptions'].setValue(this.monthOptions.find(item => item.checked)?.value);
	}

	getEnding(number: number, short = false) {
		switch (number) {
			case 0:
				return short ? 'е' : 'ее';

			case 3:
			case 5:
			case 6:
				return short ? 'я' : 'яя';

			default:
				return short ? 'й' : 'ий';
		}
	}

	genRepeats() {
		!+this.rangePeriodValue && this.iterationsForm.controls['rangePeriod'].setValue(1);
		this.isRepeatsAmountSet && +this.rangeAmountValue < 2 && this.iterationsForm.controls['rangeAmount'].setValue(2);

		if (this.isRepeatsAmountSet) {
			for (let i = 0; i < this.iterationsForm.controls['rangeAmount'].value; i++) {
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
		this.cdr.detectChanges();
	}

	getDateTime(k: number) {
		const startPointDate = +getPointDate({
			pointDate: this.rangeStartDate,
			isGreenwich: this.point?.greenwich,
			isInvert: true,
		});

		let nextPointDate: number | Date;

		switch (this.periodicityModeValue) {
			case 'perMonths':
				nextPointDate = this.getNextMatchMonth(k);
				break;
			case 'perYears':
				nextPointDate = this.getNextMatchYear(k);
				break;
			default:
				nextPointDate = startPointDate + this.periodicityValue * k;
				break;
		}

		return format(nextPointDate, Constants.fullDateFormat);
	}

	getNextMatchYear(k: number) {
		return addYears(this.rangeStartDate, this.rangePeriodValue * k);
	}

	getNextMatchMonth(k: number) {
		const sameDayOfNextMonth = addMonths(this.rangeStartDate, this.rangePeriodValue * k);
		const lastDay = lastDayOfMonth(sameDayOfNextMonth);
		const weekDay = getDay(this.rangeStartDate) as Day;

		switch (this.monthOptionsValue) {
			case 'lastDayOfMonth':
				return this.setRangeStartTime(lastDay);
			case 'secondFromTheEndDayMonth':
				return this.setRangeStartTime(subDays(lastDay, 1));
			case 'thirdFromTheEndDayMonth':
				return this.setRangeStartTime(subDays(lastDay, 2));
			case 'dayWeekNumber':
				return this.setRangeStartTime(
					addWeeks(nextDay(subDays(startOfMonth(sameDayOfNextMonth), 1), weekDay), this.dayWeekNumber - 1),
				);
			case 'dayFullWeekNumber':
				return this.setRangeStartTime(
					addWeeks(
						nextDay(
							endOfWeek(startOfMonth(sameDayOfNextMonth), {
								locale: ru,
							}),
							weekDay,
						),
						this.dayFullWeekNumber - (isMonday(startOfMonth(sameDayOfNextMonth)) ? 2 : 1),
					),
				);
			case 'lastDayWeek':
				return this.setRangeStartTime(previousDay(addDays(lastDay, 1), weekDay));
			default:
				return this.setRangeStartTime(sameDayOfNextMonth);
		}
	}

	setRangeStartTime(date: Date) {
		return getPointDate({
			pointDate: addMinutes(addHours(startOfDay(date), getHours(this.rangeStartDate)), getMinutes(this.rangeStartDate)),
			isGreenwich: this.point?.greenwich,
			isInvert: true,
		});
	}

	rangeStartDatePicked(date: Date) {
		this.rangeStartDate = date;
		this.getStartDayParam();
		this.cdr.detectChanges();
	}

	rangeEndDatePicked(date: Date) {
		this.rangeEndDate = date;
		this.cdr.detectChanges();
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
		this.cdr.detectChanges();
	}

	repeatsModeSwitcher() {
		requestAnimationFrame(() => {
			this.rangeEndRef?.fixDisabledDate();
			this.cdr.detectChanges();
		});
	}
}
