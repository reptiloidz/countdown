import {
	Component,
	EventEmitter,
	HostBinding,
	Input,
	Output,
	forwardRef,
} from '@angular/core';
import {
	ControlValueAccessor,
	FormControl,
	NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { SwitcherItem } from 'src/app/interfaces';

@Component({
	selector: 'app-switcher',
	templateUrl: './switcher.component.html',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => SwitcherComponent),
			multi: true,
		},
	],
})
export class SwitcherComponent implements ControlValueAccessor {
	@Input() items: SwitcherItem[] = [];
	@Input() value!: string;
	@Input() mode: 'ghost' = 'ghost';
	@Input() size!: 'sm';
	@Input() showTitle = false;
	@Input() switcherListClass = '';
	@Input() formControlName!: string;
	@Input() control!: FormControl;
	@Output() valueSwitched = new EventEmitter<string>();
	@HostBinding('class') get componentClass(): string | null {
		const baseClass = 'switcher';
		const modeClass = this.mode && `${baseClass}--${this.mode}`;
		const sizeClass = this.size && `${baseClass}--${this.size}`;
		return [baseClass, modeClass, sizeClass].filter((_) => _).join(' ');
	}

	private _name: string | null = null;
	@Input() get name() {
		return this._name || this.formControlName;
	}
	set name(value: string | null) {
		this._name = value || this.formControlName;
	}

	get valueName() {
		return this.items.find((item) => item.value === this.value)?.text;
	}

	onChange: (value: any) => void = () => {};
	onTouched: () => void = () => {};

	onOptionSelected(event: Event) {
		this.value = (event.target as HTMLInputElement).value;
		this.onChange(this.value);
		this.onTouched();
		this.valueSwitched.emit(this.value);
	}

	writeValue(value: string): void {
		this.value = value;
	}
	registerOnChange(fn: any): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}
	setDisabledState?(isDisabled: boolean): void {}
}
