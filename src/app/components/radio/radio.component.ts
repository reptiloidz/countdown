import { ChangeDetectionStrategy, Component, forwardRef, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { RadioItem } from 'src/app/interfaces';

@Component({
	selector: 'app-radio',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
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
	formControlName = input<string>();
	control = input<FormControl>();
	dotSize = input<'sm' | 'md'>('md');
	mode = input<'text' | 'icon' | 'custom'>('text');
	items = input<RadioItem[]>([]);
	radioClass = input('');
	nameOverride = input<string | null>(null, { alias: 'name' });
	valueSwitched = output<string>();

	readonly value = signal('');

	id = 'i-' + Math.floor(Math.random() * 10000000);

	get name() {
		return this.nameOverride() ?? this.formControlName();
	}

	onChange: (value: string) => void = () => {};
	onTouched: () => void = () => {};

	writeValue(value: string): void {
		this.value.set(value);
	}

	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState?(_isDisabled: boolean): void {}

	onRadioChange(event: Event) {
		const nextValue = (event.target as HTMLInputElement).value;
		this.value.set(nextValue);
		this.onChange(nextValue);
		this.onTouched();
		this.valueSwitched.emit(nextValue);
	}

	trackBy(index: number, item: RadioItem) {
		return item.value;
	}
}
