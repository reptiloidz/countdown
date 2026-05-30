import { ChangeDetectionStrategy, Component, forwardRef, HostBinding, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { SwitcherItem } from 'src/app/interfaces';
import { SvgComponent } from '../svg/svg.component';

@Component({
	selector: 'app-switcher',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, SvgComponent],
	templateUrl: './switcher.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => SwitcherComponent),
			multi: true,
		},
	],
})
export class SwitcherComponent implements ControlValueAccessor {
	items = input<SwitcherItem[]>([]);
	mode = input<'ghost'>('ghost');
	size = input<'sm' | 'lg'>();
	showTitle = input(false);
	switcherListClass = input('');
	formControlName = input<string>();
	control = input<FormControl>();
	nameOverride = input<string | null>(null, { alias: 'name' });
	valueSwitched = output<string>();

	readonly value = model('', { alias: 'value' });

	@HostBinding('class') get componentClass(): string | null {
		const baseClass = 'switcher';
		const modeClass = this.mode() && `${baseClass}--${this.mode()}`;
		const sizeClass = this.size() && `${baseClass}--${this.size()}`;
		return [baseClass, modeClass, sizeClass].filter(_ => _).join(' ');
	}

	id = 'i-' + Math.floor(Math.random() * 10000000);

	get name() {
		return this.nameOverride() ?? this.formControlName();
	}

	get valueName() {
		return this.items().find(item => item.value === this.value())?.text;
	}

	onChange: (value: string) => void = () => {};
	onTouched: () => void = () => {};

	onOptionSelected(event: Event) {
		const nextValue = (event.target as HTMLInputElement).value;
		this.value.set(nextValue);
		this.onChange(nextValue);
		this.onTouched();
		this.valueSwitched.emit(nextValue);
	}

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

	trackBy(index: number, item: SwitcherItem) {
		return item.value;
	}
}
