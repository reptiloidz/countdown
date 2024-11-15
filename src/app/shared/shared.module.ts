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
import { AutocompleteComponent } from '../components/autocomplete/autocomplete.component';
import { PopupComponent } from '../components/popup/popup.component';
import { RadioComponent } from '../components/radio/radio.component';
import { NotifyComponent } from '../components/notify/notify.component';
import { GenerateIterationsComponent } from '../components/generate-iterations/generate-iterations.component';
import { LoaderComponent } from '../components/loader/loader.component';

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
		AutocompleteComponent,
		PopupComponent,
		GenerateIterationsComponent,
		NotifyComponent,
		RadioComponent,
		LoaderComponent,
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
		AutocompleteComponent,
		PopupComponent,
		GenerateIterationsComponent,
		NotifyComponent,
		RadioComponent,
		LoaderComponent,
	],
	providers: [[provideNgxMask()]],
})
export class SharedModule {}
