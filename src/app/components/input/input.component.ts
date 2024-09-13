import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValidationObjectFieldValue } from 'src/app/interfaces';

@Component({
	selector: 'app-input',
	templateUrl: './input.component.html',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => InputComponent),
			multi: true,
		},
	],
})
export class InputComponent implements ControlValueAccessor {
	@HostBinding('class') get controlClass() {
		return ['control', this.invalid ? 'control--error' : null].join(' ');
	}
	@Input() placeholder = '';
	@Input() autocomplete = '';
	@Input() invalid: boolean | ValidationObjectFieldValue = false;
	@Input() formControlName!: string;
	@Input() type = 'text';
	@Input() icon!: string;
	@Input() textarea = false;
	@Input() mask: string | null = null;
	@Input() allowNegativeNumbers!: boolean;
	@Input() validation = false;
	@Input() maxlength!: number;
	@Input() min!: number;
	@Input() clearButton = false;
	@Input() clearButtonValue: string | number = '';
	@Input() clearButtonTitle = '';
	@Input() textareaRows = 5;

	value: string = '';
	isDisabled: boolean = false;

	onChange: (value: string) => void = () => {};
	onTouched: () => void = () => {};

	writeValue(value: string | number): void {
		if (typeof value === 'string' || typeof value === 'number') {
			this.value = value.toString();
		}
	}
	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}
	setDisabledState?(isDisabled: boolean): void {
		this.isDisabled = isDisabled;
	}

	onInput(event: Event): void {
		this.value = (event.target as HTMLInputElement).value || '';
		this.onChange(this.value);
		this.onTouched();
	}

	resetValue() {
		this.writeValue(this.clearButtonValue);
	}
}
