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
		return ['control', this.invalid && 'control--error'].join(' ');
	}
	@Input() placeholder = '';
	@Input() invalid: boolean | ValidationObjectFieldValue = false;
	@Input() formControlName!: string;
	@Input() type = 'text';

	value: string = '';
	isDisabled: boolean = false;

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
	setDisabledState?(isDisabled: boolean): void {
		this.isDisabled = isDisabled;
	}

	onInput(event: Event): void {
		this.value = (event.target as HTMLInputElement).value || '';
		this.onChange(this.value);
		this.onTouched();
	}
}
