import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
	addDays,
	addMonths,
	getDate,
	getDay,
	getDaysInMonth,
	getMonth,
	getYear,
	isMonday,
	lastDayOfMonth,
	previousMonday,
	startOfDay,
	startOfMonth,
	subDays,
	subMonths,
} from 'date-fns';
import { CalendarDate } from 'src/app/interfaces/calendarDate.interface';

@Component({
	selector: 'app-calendar',
	templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit {
	private nowDate = new Date();
	private lastDateOfCurrentMonth!: Date;
	private firstMonday!: Date;
	private selectedDate = this.nowDate;
	private currentDate = this.nowDate;

	@Output() dateSelected = new EventEmitter<Date>();

	ngOnInit() {
		// console.log(this.getCurrentDateParams());
		// this.getCurrentDateParams();
		console.log(this.generateMonth());
	}

	getCurrentDateParams(currentDate: Date) {
		this.currentDate = currentDate;
		this.lastDateOfCurrentMonth = lastDayOfMonth(currentDate);
		this.firstMonday = isMonday(startOfMonth(currentDate))
			? startOfMonth(currentDate)
			: previousMonday(startOfMonth(currentDate));

		// return {
		// 	currentMonth: getMonth(currentDate),
		// 	currentYear: getYear(currentDate),
		// 	daysInCurrentMonth: getDaysInMonth(currentDate),
		// 	currentDayOfWeek: getDay(startOfMonth(currentDate)),
		// 	daysInPreviousMonth: getDate(subDays(startOfMonth(currentDate), 1)),
		// 	lastDateOfCurrentMonth: lastDayOfMonth(currentDate),
		// 	firstMonday: isMonday(startOfMonth(currentDate)) ? startOfMonth(currentDate) : previousMonday(startOfMonth(currentDate)),
		// }
	}

	dateClicked(date: Date) {
		this.dateSelected.emit(date);
	}

	generateMonth(date: Date = this.currentDate) {
		this.getCurrentDateParams(date);

		let monthArray = [];
		let allDaysIterated = false;
		let previousDate!: Date;

		while (!allDaysIterated) {
			let weekArray: CalendarDate[] = [];

			for (let i = 0; i < 7; i++) {
				if (!previousDate) {
					const thisDate = this.firstMonday;
					weekArray.push({
						date: thisDate,
						currentDate: this.isCurrentDate(thisDate),
						selectedDate: this.isSelectedDate(thisDate),
						nowDate: this.isNowDate(thisDate),
					});
					previousDate = thisDate;
				} else {
					const thisDate = addDays(previousDate, 1);
					weekArray.push({
						date: thisDate,
						currentDate: this.isCurrentDate(thisDate),
						selectedDate: this.isSelectedDate(thisDate),
						nowDate: this.isNowDate(thisDate),
					});
					previousDate = thisDate;

					if (+thisDate === +this.lastDateOfCurrentMonth) {
						allDaysIterated = true;
					}
				}
			}

			monthArray.push(weekArray);
		}

		return monthArray;
	}

	isCurrentDate(date: Date) {
		return +date === +startOfDay(this.currentDate);
	}

	isSelectedDate(date: Date) {
		return +date === +startOfDay(this.selectedDate);
	}

	isNowDate(date: Date) {
		return +date === +startOfDay(this.nowDate);
	}

	previous() {
		this.generateMonth(subMonths(this.currentDate, 1));
	}

	next() {
		this.generateMonth(addMonths(this.currentDate, 1));
	}
}
