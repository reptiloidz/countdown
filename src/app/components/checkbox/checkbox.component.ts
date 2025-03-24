import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostBinding,
	Input,
	OnDestroy,
	OnInit,
	forwardRef,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActionService } from 'src/app/services';

@Component({
	selector: '[app-checkbox]',
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
		return ['checkbox state', this.mode !== 'text' && 'checkbox--' + this.mode].filter(_ => _).join(' ');
	}
	@HostBinding('attr.for') get for() {
		return this.name || null;
	}
	@Input() formControlName!: string;
	@Input() control!: FormControl;
	@Input() iconSize: 'sm' | 'md' = 'md';
	@Input() mode: 'text' | 'icon' | 'custom' = 'text';
	@Input() isChecked = false;
	@Input() isDisabled = false;
	@Input() icon!: string;

	private _name: string | null = null;
	@Input() get name() {
		return this._name || this.formControlName;
	}
	set name(value: string | null) {
		this._name = value || this.formControlName;
	}

	private subscriptions = new Subscription();

	constructor(
		private cdr: ChangeDetectorRef,
		private action: ActionService,
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.action.eventPointsCheckedAll$.subscribe({
				next: () => {
					this.cdr.detectChanges();
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
