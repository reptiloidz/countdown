import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatepickerComponent } from 'src/app/components/datepicker/datepicker.component';
import { DropComponent } from 'src/app/components/drop/drop.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarComponent } from 'src/app/components/calendar/calendar.component';

@NgModule({
	declarations: [DatepickerComponent, DropComponent, CalendarComponent],
	imports: [CommonModule, FormsModule, ReactiveFormsModule],
	exports: [DatepickerComponent, DropComponent, CalendarComponent],
})
export class SharedModule {}
