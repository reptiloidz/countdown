import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatepickerComponent } from 'src/app/components/datepicker/datepicker.component';
import { DropComponent } from 'src/app/components/drop/drop.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarComponent } from 'src/app/components/calendar/calendar.component';
import { ButtonComponent } from './components/button/button.component';
import { SwitcherComponent } from './components/switcher/switcher.component';
import { InputComponent } from './components/input/input.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { LetDirective } from './directives/let.directive';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { PopupComponent } from './components/popup/popup.component';
import { NotifyComponent } from './components/notify/notify.component';
import { LoaderComponent } from './components/loader/loader.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { RadioComponent } from './components/radio/radio.component';
import { SvgComponent } from './components/svg/svg.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

const STANDALONE_UI = [
	ButtonComponent,
	CheckboxComponent,
	RadioComponent,
	SwitcherComponent,
	LoaderComponent,
	SvgComponent,
];

@NgModule({
	declarations: [
		InputComponent,
		PopupComponent,
		NotifyComponent,
		DatepickerComponent,
		DropComponent,
		CalendarComponent,
		TooltipComponent,
		AutocompleteComponent,
		LetDirective,
		SafeHtmlPipe,
	],
	imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective, ...STANDALONE_UI],
	exports: [
		...STANDALONE_UI,
		InputComponent,
		PopupComponent,
		NotifyComponent,
		DatepickerComponent,
		DropComponent,
		CalendarComponent,
		TooltipComponent,
		AutocompleteComponent,
		LetDirective,
		SafeHtmlPipe,
	],
	providers: [[provideNgxMask()]],
})
export class SharedModule {}
