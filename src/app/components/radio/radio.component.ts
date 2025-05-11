import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RadioItem } from 'src/app/interfaces';

@Component({
	selector: 'app-radio',
	templateUrl: './radio.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => RadioComponent),
			multi: true,
		},
	],
})
export class RadioComponent implements ControlValueAccessor {
	@Input() formControlName!: string;
	@Input() control!: FormControl;
	@Input() dotSize: 'sm' | 'md' = 'md';
	@Input() mode: 'text' | 'icon' | 'custom' = 'text';
	@Input() items: RadioItem[] = [];
	@Input() value!: string;
	@Input() radioClass = '';
	@Output() valueSwitched = new EventEmitter<string>();

	private _name: string | null = null;

	id = 'cb-' + Math.floor(Math.random() * 10000);

	@Input() get name() {
		return this._name ?? this.formControlName;
	}
	set name(value: string | null) {
		this._name = value ?? this.formControlName;
	}

	onChange: (value: string) => void = () => {};
	onTouched: () => void = () => {};

	writeValue(value: string): void {
		this.value = value;
	}
	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	setDisabledState?(isDisabled: boolean): void {}

	onRadioChange(event: Event) {
		this.value = (event.target as HTMLInputElement).value;
		this.onChange(this.value);
		this.onTouched();
		this.valueSwitched.emit(this.value);
	}

	trackBy(index: number, item: RadioItem) {
		return item.value;
	}
}
