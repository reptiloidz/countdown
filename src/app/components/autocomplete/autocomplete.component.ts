import {
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	inject,
	input,
	model,
	OnDestroy,
	output,
	untracked,
	ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getKeyByValue } from 'src/app/helpers';
import { SelectArray } from 'src/app/interfaces';
import { DropComponent } from '../drop/drop.component';
import { InputComponent } from '../input/input.component';
import { ActionService } from 'src/app/services';
import { filter, Subscription } from 'rxjs';
import { NgxMaskConfig } from 'ngx-mask';

const defaultFilterFn = (item: SelectArray, filterValue: string) =>
	item.value.toString().includes(filterValue) && !item.disabled;

@Component({
	selector: 'app-autocomplete',
	standalone: true,
	imports: [CommonModule, FormsModule, DropComponent, InputComponent],
	templateUrl: './autocomplete.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteComponent implements OnDestroy {
	private readonly action = inject(ActionService);

	value = input<string | number>('');
	/** Начальное отображаемое значение с родителя (datepicker) */
	visibleValueInput = input('', { alias: 'visibleValue' });
	placeholder = input('');
	inputmode = input<string | null>(null);
	autocompleteList = input.required<SelectArray[]>();
	mask = input<string | null>(null);
	patterns = input<NgxMaskConfig['patterns']>({});
	suffix = input('');
	prefix = input('');
	filterFn = input(defaultFilterFn);
	dataSuffix = input('');
	autofocus = input(false);

	autocompleteChanged = output<string | number>();

	/** Текст в поле ввода; связан с app-input через ngModel */
	readonly visibleValue = model('');

	readonly autocompleteListFiltered = computed(() => {
		const list = this.autocompleteList();
		const filterString = this.visibleValue();
		if (!filterString) {
			return list;
		}
		const filtered = list.filter(item => this.filterFn()(item, filterString));
		return filtered.length ? filtered : list;
	});

	readonly firstFilteredValue = computed(() => this.autocompleteListFiltered()[0]);

	@ViewChild(DropComponent, { static: true }) drop!: DropComponent;

	private isOpening = false;
	private readonly subscriptions = new Subscription();

	constructor() {
		effect(() => {
			this.value();
			this.visibleValueInput();
			this.autocompleteList();
			untracked(() => this.syncVisibleValueFromInputs());
		});

		this.subscriptions.add(
			this.action.eventAutocompleteOpened$.pipe(filter(() => this.isOpening)).subscribe({
				next: () => {
					if (!this.isOpening) {
						this.drop.closeHandler();
					}
					this.isOpening = false;
				},
			}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	private syncVisibleValueFromInputs(): void {
		const fromValue = getKeyByValue(this.autocompleteList(), this.value())?.toString();
		this.visibleValue.set(fromValue ?? this.visibleValueInput());
	}

	changeHandler(value: string | number) {
		this.autocompleteChanged.emit(value);
		const visible = getKeyByValue(this.autocompleteList(), value)?.toString() ?? this.visibleValue();
		this.visibleValue.set(visible);
	}

	onVisibleValueChange(filterValue?: string | number | null) {
		this.visibleValue.set(filterValue == null ? '' : String(filterValue));
	}

	selectFirstOption() {
		this.drop.closeHandler();
		(document.activeElement as HTMLElement | null)?.blur();
		this.changeHandler(this.firstFilteredValue() ? this.firstFilteredValue()!.value : this.value());
	}

	keydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			this.selectFirstOption();
		}
	}

	openHandler() {
		this.isOpening = true;
		this.action.autocompleteOpened();
		this.drop.openHandler();
	}

	closeHandler() {
		const visible = getKeyByValue(this.autocompleteList(), this.value())?.toString() ?? this.visibleValue();
		this.visibleValue.set(visible);
	}
}
