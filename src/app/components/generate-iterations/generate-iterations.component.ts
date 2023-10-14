import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { format, parse } from 'date-fns';
import { Constants } from 'src/app/enums';
import { getPointDate } from 'src/app/helpers';
import { Iteration } from 'src/app/interfaces/iteration.interface';

@Component({
	selector: 'app-generate-iterations',
	templateUrl: './generate-iterations.component.html',
})
export class GenerateIterationsComponent implements OnInit {
	@Input() form!: FormGroup;
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

	get periodicity() {
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
				const date =
					+parse(
						this.iterationsForm.controls['rangeStartDate'].value,
						Constants.shortDateFormat,
						getPointDate(
							new Date(),
							this.tzOffset,
							this.form.controls['greenwich'].value,
							true
						)
					) +
					this.periodicity * i;
				const dateTime = format(
					getPointDate(
						new Date(
							+parse(
								this.iterationsForm.controls['rangeStartTime']
									.value,
								Constants.timeFormat,
								new Date(date)
							) +
								this.periodicity * i
						),
						this.tzOffset,
						this.form.controls['greenwich'].value,
						true
					),
					Constants.fullDateFormat
				);

				this.repeats.push({
					date: dateTime,
					reason: 'frequency',
				});
			}
		} else {
			// TODO
		}

		this.repeatsIsGenerated.emit(this.repeats);
	}
}
