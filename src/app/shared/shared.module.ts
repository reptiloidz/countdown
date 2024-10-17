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
import { CheckboxComponent } from '../components/checkbox/checkbox.component';
import { LetDirective } from '../directives/let.directive';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { SortKeyValuePipe } from '../pipes/sortKeyValue.pipe';

@NgModule({
	declarations: [
		DatepickerComponent,
		DropComponent,
		CalendarComponent,
		ButtonComponent,
		SvgComponent,
		SwitcherComponent,
		InputComponent,
		CheckboxComponent,
		LetDirective,
		SortKeyValuePipe,
	],
	imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective],
	exports: [
		DatepickerComponent,
		DropComponent,
		CalendarComponent,
		ButtonComponent,
		SvgComponent,
		SwitcherComponent,
		InputComponent,
		CheckboxComponent,
		LetDirective,
	],
	providers: [[provideNgxMask()]],
})
export class SharedModule {}
