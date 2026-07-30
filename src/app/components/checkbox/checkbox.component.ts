import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	HostBinding,
	input,
	model,
	OnDestroy,
	OnInit,
	signal,
	forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActionService } from 'src/app/services';
import { SvgComponent } from '../svg/svg.component';

@Component({
	selector: '[app-checkbox]',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, SvgComponent],
	templateUrl: './checkbox.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => CheckboxComponent),
			multi: true,
		},
	],
})
export class CheckboxComponent implements ControlValueAccessor, OnInit, OnDestroy {
	@HostBinding('class') get controlClass() {
		const mode = this.mode();
		return ['checkbox state', mode !== 'text' && 'checkbox--' + mode].filter(_ => _).join(' ');
	}

	formControlName = input<string>();
	control = input<FormControl>();
	iconSize = input<'sm' | 'md'>('md');
	mode = input<'text' | 'icon' | 'custom' | 'privacy'>('text');
	isDisabled = input(false);
	icon = input<string>();
	nameOverride = input<string | null>(null, { alias: 'name' });

	readonly checked = model(false, { alias: 'isChecked' });
	private disabledFromCva = signal<boolean | null>(null);
	readonly isDisabledState = computed(() => this.disabledFromCva() ?? this.isDisabled());

	private subscriptions = new Subscription();

	id = 'i-' + Math.floor(Math.random() * 10000000);

	@HostBinding('attr.for') for = this.id;

	constructor(
		private cdr: ChangeDetectorRef,
		private action: ActionService,
	) {}

	get name() {
		return this.nameOverride() ?? this.formControlName();
	}

	ngOnInit(): void {
		this.subscriptions.add(
			this.action.eventPointsCheckedAll$.subscribe({
				next: () => {
					this.cdr.markForCheck();
				},
			}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	onChange: (value: boolean) => void = () => {};
	onTouched: () => void = () => {};

	writeValue(isChecked: boolean): void {
		this.checked.set(isChecked);
		this.cdr.markForCheck();
	}

	registerOnChange(fn: (value: boolean) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState?(isDisabled: boolean): void {
		this.disabledFromCva.set(isDisabled);
		this.cdr.markForCheck();
	}

	onCheckboxChange(event: Event): void {
		const inputEl = event.target as HTMLInputElement;
		this.checked.set(inputEl.checked);
		this.onChange(this.checked());
		this.onTouched();
	}
}
