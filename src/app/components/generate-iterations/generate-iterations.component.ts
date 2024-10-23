import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { format } from 'date-fns';
import { Constants } from 'src/app/enums';
import { getInvertedObject, getPointDate, parseDate } from 'src/app/helpers';
import { Iteration, SwitcherItem } from 'src/app/interfaces';

@Component({
	selector: 'app-generate-iterations',
	templateUrl: './generate-iterations.component.html',
})
export class GenerateIterationsComponent {
	@Input() form!: FormGroup;
	@Input() loading = false;
	@Output() repeatsAreGenerated = new EventEmitter<Iteration[]>();

	rangeStartDate = new Date();
	rangeEndDate = new Date(+new Date() + Constants.msInMinute * 10);
	repeats: Iteration[] = [];

	periodicityList = {
		perMinutes: 'Минут',
		perHours: 'Часов',
		perDays: 'Дней',
		perWeeks: 'Недель',
		perMonths: 'Месяцев',
		perYears: 'Лет',
	};

	repeatsModeList: SwitcherItem[] = [
		{
			text: 'Задать число повторов',
			value: 'setRepeatsAmount',
			icon: 'refresh',
		},
		{
			text: 'Задать конец диапазона',
			value: 'setRangeEnd',
			icon: 'calendar-clock',
		},
	];

	get periodicityListInverted() {
		return getInvertedObject(this.periodicityList);
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
				periodicity = Constants.msInMinute * 60 * 24 * 7 * 30;
				break;

			case 'perYears':
				periodicity = Constants.msInMinute * 60 * 24 * 7 * 30 * 12;
				break;

			default:
				periodicity = Constants.msInMinute;
				break;
		}

		return periodicity * this.iterationsForm.controls['rangePeriod'].value;
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
	}

	rangeEndDatePicked(date: Date) {
		this.rangeEndDate = date;
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
