import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { getHours, getMinutes, getMonth, getYear } from 'date-fns';

@Component({
	selector: 'app-datepicker',
	templateUrl: './datepicker.component.html',
})
export class DatepickerComponent implements OnInit {
	dateForm!: FormGroup;
	dropOpen = false;

	ngOnInit(): void {
		this.dateForm = new FormGroup({
			year: new FormControl(getYear(new Date())),
			month: new FormControl(getMonth(new Date()) + 1),
			hour: new FormControl(getHours(new Date())),
			minute: new FormControl(getMinutes(new Date())),
		});
	}

	toggleDate() {
		this.dropOpen = !this.dropOpen;
	}
}
