import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatepickerComponent } from 'src/app/components/datepicker/datepicker.component';
import { DropComponent } from 'src/app/components/drop/drop.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarComponent } from 'src/app/components/calendar/calendar.component';
import { ButtonComponent } from '../components/button/button.component';
import { SvgComponent } from '../components/svg/svg.component';
import { SwitcherComponent } from '../components/switcher/switcher.component';
import { InputComponent } from '../components/input/input.component';

@NgModule({
	declarations: [
		DatepickerComponent,
		DropComponent,
		CalendarComponent,
		ButtonComponent,
		SvgComponent,
		SwitcherComponent,
		InputComponent,
	],
	imports: [CommonModule, FormsModule, ReactiveFormsModule],
	exports: [
		DatepickerComponent,
		DropComponent,
		CalendarComponent,
		ButtonComponent,
		SvgComponent,
		SwitcherComponent,
		InputComponent,
	],
})
export class SharedModule {}
