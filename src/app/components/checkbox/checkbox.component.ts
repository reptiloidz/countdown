import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import {
	ControlValueAccessor,
	FormControl,
	NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
	selector: '[app-checkbox]',
	templateUrl: './checkbox.component.html',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => CheckboxComponent),
			multi: true,
		},
	],
})
export class CheckboxComponent implements ControlValueAccessor {
	@HostBinding('class') get controlClass() {
		return ['checkbox'].join(' ');
	}
	@HostBinding('attr.for') get for() {
		return this.name || null;
	}
	@Input() formControlName!: string;
	@Input() control!: FormControl;
	@Input() iconSize: 'sm' | 'md' = 'md';

	private _name: string | null = null;
	@Input() get name() {
		return this._name || this.formControlName;
	}
	set name(value: string | null) {
		this._name = value || this.formControlName;
	}

	isChecked = false;
	isDisabled: boolean = false;

	onChange: (value: boolean) => void = () => {};
	onTouched: () => void = () => {};

	writeValue(isChecked: boolean): void {
		this.isChecked = isChecked;
	}
	registerOnChange(fn: (value: boolean) => void): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}
	setDisabledState?(isDisabled: boolean): void {
		this.isDisabled = isDisabled;
	}

	onCheckboxChange(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.isChecked = input.checked;
		this.onChange(this.isChecked);
		this.onTouched();
	}
}
