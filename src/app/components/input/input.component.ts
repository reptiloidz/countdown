import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
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
import { DeviceDetectorService } from 'ngx-device-detector';
import { NgxMaskConfig } from 'ngx-mask';
import { ValidationObjectFieldValue } from 'src/app/interfaces';

@Component({
	selector: 'app-input',
	templateUrl: './input.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => InputComponent),
			multi: true,
		},
	],
})
export class InputComponent implements ControlValueAccessor, AfterViewInit {
	@HostBinding('class') get controlClass() {
		return ['control', this.invalid ? 'control--error' : null].join(' ');
	}
	@Input() placeholder = '';
	@Input() autocomplete = '';
	@Input() invalid: boolean | ValidationObjectFieldValue = false;
	@Input() formControlName!: string;
	@Input() name!: string;
	@Input() type = 'text';
	@Input() inputmode: string | null = null;
	@Input() icon!: string;
	@Input() textarea = false;
	@Input() autofocus = false;
	@Input() mask: string | null = null;
	@Input() patterns!: NgxMaskConfig['patterns'];
	@Input() suffix: string = '';
	@Input() prefix: string = '';
	@Input() allowNegativeNumbers!: boolean;
	@Input() validation = false;
	@Input() maxlength!: number;
	@Input() min!: number;
	@Input() max!: number;
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

	@Input() isDisabled: boolean = false;

	@ViewChild('inputRef') inputRef!: ElementRef;

	constructor(
		private cdr: ChangeDetectorRef,
		private deviceService: DeviceDetectorService,
	) {}

	get showPasswordTitle(): string {
		return this.type === 'text' ? 'Скрыть пароль' : 'Показать пароль';
	}

	get showPasswordIcon(): string {
		return this.type === 'text' ? 'lock-off' : 'lock';
	}

	ngAfterViewInit(): void {
		if (this.autofocus && this.inputRef?.nativeElement && this.deviceService.isDesktop()) {
			this.inputRef?.nativeElement.focus();
		}
	}

	onChange: (value: string | number) => void = () => {};
	onTouched: () => void = () => {};

	writeValue(value: string | number): void {
		if (typeof value === 'string' || typeof value === 'number') {
			this.value = value.toString();
		}
		this.cdr.markForCheck();
	}
	registerOnChange(fn: (value: string | number) => void): void {
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
		this.cdr.markForCheck();
	}

	resetValue() {
		this.writeValue(this.clearButtonValue);
		this.onChange(this.clearButtonValue);
		this.inputRef.nativeElement.focus();
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
