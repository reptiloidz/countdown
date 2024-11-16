import {
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	Input,
	Output,
	ViewChild,
	forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IConfig } from 'ngx-mask';
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
	@Input() name!: string;
	@Input() type = 'text';
	@Input() icon!: string;
	@Input() textarea = false;
	@Input() mask: string | null = null;
	@Input() patterns!: IConfig['patterns'];
	@Input() suffix: string = '';
	@Input() prefix: string = '';
	@Input() allowNegativeNumbers!: boolean;
	@Input() validation = false;
	@Input() maxlength!: number;
	@Input() min!: number;
	@Input() clearButton = false;
	@Input() showPasswordButton = false;
	@Input() clearButtonValue: string | number = '';
	@Input() clearButtonTitle = '';
	@Input() textareaRows = 5;

	@Output() focus = new EventEmitter<FocusEvent>();
	@Output() blur = new EventEmitter<FocusEvent>();
	@Output() keydown = new EventEmitter<KeyboardEvent>();
	@Output() reset = new EventEmitter<string | number>();

	@Input() value: string | number = '';

	@ViewChild('inputRef') inputRef!: ElementRef;

	isDisabled: boolean = false;

	get showPasswordTitle(): string {
		return this.type === 'text' ? 'Скрыть пароль' : 'Показать пароль';
	}

	get showPasswordIcon(): string {
		return this.type === 'text' ? 'lock-off' : 'lock';
	}

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
		this.reset.emit(this.value);
	}

	showPassword() {
		this.type = this.type === 'text' ? 'password' : 'text';
	}

	focusHandler(event: FocusEvent) {
		this.focus.emit(event);
	}

	blurHandler(event: FocusEvent) {
		this.blur.emit(event);
	}

	blurInput() {
		this.inputRef.nativeElement.blur();
	}

	keydownHandler(event: KeyboardEvent) {
		this.keydown.emit(event);
	}
}
