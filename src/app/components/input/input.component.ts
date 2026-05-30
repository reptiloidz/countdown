import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	ElementRef,
	forwardRef,
	HostBinding,
	input,
	model,
	output,
	signal,
	viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NgxMaskConfig, NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ValidationObjectFieldValue } from 'src/app/interfaces';
import { ButtonComponent } from '../button/button.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
	selector: 'app-input',
	standalone: true,
	imports: [CommonModule, FormsModule, NgxMaskDirective, SvgComponent, ButtonComponent],
	templateUrl: './input.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => InputComponent),
			multi: true,
		},
		provideNgxMask(),
	],
})
export class InputComponent implements ControlValueAccessor, AfterViewInit {
	@HostBinding('class') get controlClass() {
		return ['control', this.invalid() ? 'control--error' : null].join(' ');
	}

	placeholder = input('');
	autocomplete = input('');
	invalid = input<boolean | ValidationObjectFieldValue>(false);
	formControlName = input<string>();
	name = input<string>();
	readonly type = model('text');
	inputmode = input<string | null>(null);
	icon = input<string>();
	textarea = input(false);
	autofocus = input(false);
	mask = input<string | null>(null);
	patterns = input<NgxMaskConfig['patterns']>();
	suffix = input('');
	prefix = input('');
	allowNegativeNumbers = input<boolean>();
	validation = input(false);
	maxlength = input<number>();
	min = input<number>();
	max = input<number>();
	clearButton = input(false);
	showPasswordButton = input(false);
	clearButtonValue = input<string | number>('');
	clearButtonTitle = input('');
	textareaRows = input(5);

	focus = output<FocusEvent>();
	blur = output<FocusEvent>();
	keydown = output<KeyboardEvent>();
	reset = output<string | number>();

	readonly value = model<string | number>('');
	isDisabled = input(false);
	private disabledFromCva = signal<boolean | null>(null);
	readonly isDisabledState = computed(() => this.disabledFromCva() ?? this.isDisabled());

	inputRef = viewChild<ElementRef>('inputRef');

	constructor(
		private cdr: ChangeDetectorRef,
		private deviceService: DeviceDetectorService,
	) {}

	get showPasswordTitle(): string {
		return this.type() === 'text' ? 'Скрыть пароль' : 'Показать пароль';
	}

	get showPasswordIcon(): string {
		return this.type() === 'text' ? 'lock-off' : 'lock';
	}

	ngAfterViewInit(): void {
		const inputEl = this.inputRef()?.nativeElement;
		if (this.autofocus() && inputEl && this.deviceService.isDesktop()) {
			inputEl.focus();
		}
	}

	onChange: (value: string | number) => void = () => {};
	onTouched: () => void = () => {};

	writeValue(value: string | number): void {
		if (typeof value === 'string' || typeof value === 'number') {
			this.value.set(value.toString());
		}
		this.cdr.markForCheck();
	}

	registerOnChange(fn: (value: string | number) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState?(isDisabled: boolean): void {
		this.disabledFromCva.set(isDisabled);
		this.cdr.markForCheck();
	}

	onInput(event: Event): void {
		this.value.set((event.target as HTMLInputElement).value || '');
		this.onChange(this.value());
		this.onTouched();
		this.cdr.markForCheck();
	}

	resetValue() {
		this.writeValue(this.clearButtonValue());
		this.onChange(this.clearButtonValue());
		this.inputRef()?.nativeElement.focus();
		this.reset.emit(this.value());
	}

	showPassword() {
		this.type.set(this.type() === 'text' ? 'password' : 'text');
	}

	focusHandler(event: FocusEvent) {
		this.focus.emit(event);
	}

	blurHandler(event: FocusEvent) {
		this.blur.emit(event);
	}

	blurInput() {
		this.inputRef()?.nativeElement.blur();
	}

	keydownHandler(event: KeyboardEvent) {
		this.keydown.emit(event);
	}
}
