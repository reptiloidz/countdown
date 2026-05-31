import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	ElementRef,
	EventEmitter,
	forwardRef,
	HostBinding,
	input,
	Input,
	model,
	OnChanges,
	output,
	Output,
	signal,
	SimpleChanges,
	ViewChild,
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
export class InputComponent implements ControlValueAccessor, AfterViewInit, OnChanges {
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

	/** @Input, не signal: ngx-mask v19 вешается на `input[mask]` только когда атрибут уже есть */
	@Input() mask: string | null = null;
	@Input() patterns: NgxMaskConfig['patterns'] = {};
	@Input() suffix = '';
	@Input() prefix = '';
	@Input() allowNegativeNumbers: boolean | null = null;
	@Input() validation = false;

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

	@Input() value: string | number = '';
	@Output() valueChange = new EventEmitter<string | number>();

	isDisabled = input(false);
	private disabledFromCva = signal<boolean | null>(null);
	readonly isDisabledState = computed(() => this.disabledFromCva() ?? this.isDisabled());

	@ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;
	@ViewChild(NgxMaskDirective) maskDirective?: NgxMaskDirective;

	private syncingMask = false;

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

	get valueStr(): string {
		return this.value == null ? '' : String(this.value);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['value'] || changes['mask']) {
			this.scheduleMaskWrite();
		}
	}

	ngAfterViewInit(): void {
		this.scheduleMaskWrite();

		if (this.autofocus() && this.inputRef?.nativeElement && this.deviceService.isDesktop()) {
			this.inputRef.nativeElement.focus();
		}
	}

	onChange: (value: string | number) => void = () => {};
	onTouched: () => void = () => {};

	writeValue(value: string | number | null): void {
		if (typeof value === 'string' || typeof value === 'number') {
			this.value = value.toString();
		} else if (value === null) {
			this.value = '';
		}
		this.cdr.markForCheck();
		this.scheduleMaskWrite();
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
		if (this.syncingMask) {
			return;
		}

		const next = (event.target as HTMLInputElement).value ?? '';
		this.value = next;
		this.valueChange.emit(this.value);
		// Всегда пробрасываем в host ngModel — иначе autocomplete filter не вызывается
		this.onChange(this.value);
		this.onTouched();
		this.cdr.markForCheck();
	}

	resetValue() {
		this.writeValue(this.clearButtonValue());
		this.onChange(this.clearButtonValue());
		this.inputRef?.nativeElement.focus();
		this.reset.emit(this.value);
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
		this.inputRef?.nativeElement.blur();
	}

	keydownHandler(event: KeyboardEvent) {
		this.keydown.emit(event);
	}

	private scheduleMaskWrite(): void {
		if (!this.valueStr || !this.mask) {
			return;
		}
		setTimeout(() => void this.applyMaskValue(), 0);
	}

	private async applyMaskValue(): Promise<void> {
		if (!this.valueStr || !this.mask || !this.maskDirective) {
			return;
		}

		this.syncingMask = true;
		try {
			await this.maskDirective.writeValue(this.valueStr);
		} finally {
			this.syncingMask = false;
			this.cdr.markForCheck();
		}
	}
}
