import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { format, parse } from 'date-fns';
import { Constants } from 'src/app/enums';
import { getPointDate } from 'src/app/helpers';
import { Iteration } from 'src/app/interfaces';

@Component({
	selector: 'app-generate-iterations',
	templateUrl: './generate-iterations.component.html',
})
export class GenerateIterationsComponent implements OnInit {
	@Input() form!: FormGroup;
	@Input() loading = false;
	@Output() repeatsIsGenerated = new EventEmitter<Iteration[]>();

	tzOffset = new Date().getTimezoneOffset();
	repeats: Iteration[] = [];

	ngOnInit(): void {}

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

		this.repeatsIsGenerated.emit(this.repeats);

		this.repeats = [];
	}

	getDateTime(k: number) {
		const date = +parse(
			this.iterationsForm.controls['rangeStartDate'].value,
			Constants.shortDateFormat,
			getPointDate({
				tzOffset: this.tzOffset,
				isGreenwich: this.form.controls['greenwich'].value,
				isInvert: true,
			})
		);

		return format(
			getPointDate({
				pointDate: new Date(
					+parse(
						this.iterationsForm.controls['rangeStartTime'].value,
						Constants.timeFormat,
						new Date(date)
					) +
						this.periodicityValue * k
				),
				tzOffset: this.tzOffset,
				isGreenwich: this.form.controls['greenwich'].value,
				isInvert: true,
			}),
			Constants.fullDateFormat
		);
	}

	addIterationRecursively(k: number) {
		const currentDateTime = this.getDateTime(k);

		const dateTime = getPointDate({
			tzOffset: this.tzOffset,
			isGreenwich: this.form.controls['greenwich'].value,
			isInvert: true,
			datePart: this.iterationsForm.controls['rangeEndDate'].value,
			timePart: this.iterationsForm.controls['rangeEndTime'].value,
		});

		if (
			parse(currentDateTime, Constants.fullDateFormat, new Date()) <=
			dateTime
		) {
			this.repeats.push({
				date: currentDateTime,
				reason: 'frequency',
			});
			this.addIterationRecursively(k + 1);
		}
	}
}
