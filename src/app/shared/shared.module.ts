import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatepickerComponent } from 'src/app/components/datepicker/datepicker.component';
import { DropComponent } from 'src/app/components/drop/drop.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarComponent } from 'src/app/components/calendar/calendar.component';
import { ButtonComponent } from '../components/button/button.component';
import { SwitcherComponent } from '../components/switcher/switcher.component';
import { InputComponent } from '../components/input/input.component';
import { CheckboxComponent } from '../components/checkbox/checkbox.component';
import { LetDirective } from '../directives/let.directive';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { AutocompleteComponent } from '../components/autocomplete/autocomplete.component';
import { PopupComponent } from '../components/popup/popup.component';
import { NotifyComponent } from '../components/notify/notify.component';
import { LoaderComponent } from '../components/loader/loader.component';
import { TooltipComponent } from '../components/tooltip/tooltip.component';
import { SvgModule } from '../svg/svg.module';

@NgModule({
	declarations: [
		ButtonComponent,
		InputComponent,
		CheckboxComponent,
		PopupComponent,
		NotifyComponent,
		LoaderComponent,
		DatepickerComponent,
		DropComponent,
		CalendarComponent,
		SwitcherComponent,
		TooltipComponent,
		AutocompleteComponent,
		LetDirective,
	],
	imports: [CommonModule, FormsModule, ReactiveFormsModule, SvgModule, NgxMaskDirective],
	exports: [
		ButtonComponent,
		InputComponent,
		CheckboxComponent,
		PopupComponent,
		NotifyComponent,
		LoaderComponent,
		DatepickerComponent,
		DropComponent,
		CalendarComponent,
		SwitcherComponent,
		TooltipComponent,
		AutocompleteComponent,
		LetDirective,
	],
	providers: [[provideNgxMask()]],
})
export class SharedModule {}
