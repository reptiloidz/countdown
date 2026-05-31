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
	signal,
	untracked,
	ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
	imports: [CommonModule, DropComponent, InputComponent],
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

	/** Текст в поле ввода; связан с app-input */
	readonly visibleValue = model('');

	/**
	 * Строка фильтра списка (как filter() в релизе).
	 * undefined — показывать весь список (после открытия, до ввода).
	 */
	private readonly listFilterQuery = signal<string | undefined>(undefined);

	readonly autocompleteListFiltered = computed(() => {
		const list = this.autocompleteList();
		const query = this.listFilterQuery();
		if (query === undefined || query === '') {
			return list;
		}
		const filtered = list.filter(item => this.filterFn()(item, query));
		return filtered.length ? filtered : list;
	});

	readonly firstFilteredValue = computed(() => this.autocompleteListFiltered()[0]);

	@ViewChild(DropComponent, { static: true }) drop!: DropComponent;
	@ViewChild(InputComponent) input?: InputComponent;

	private isOpening = false;
	/** Значение только что применено — value() с родителя ещё не обновился при dropClosed */
	private lastCommittedValue: string | number | null = null;
	private readonly subscriptions = new Subscription();

	constructor() {
		// autocompleteList не в deps: datepicker.yearsArray каждый CD — новый [], иначе сброс ввода
		effect(() => {
			this.value();
			this.visibleValueInput();
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
		const fromKey = getKeyByValue(this.autocompleteList(), this.value())?.toString();
		const fromParent = this.visibleValueInput();
		const next = fromKey ?? (fromParent !== '' && fromParent != null ? String(fromParent) : this.visibleValue());
		if (this.visibleValue() !== next) {
			this.visibleValue.set(next);
		}
	}

	changeHandler(value: string | number) {
		this.lastCommittedValue = value;
		this.autocompleteChanged.emit(value);
		const visible = getKeyByValue(this.autocompleteList(), value)?.toString() ?? this.visibleValue();
		this.visibleValue.set(visible);
	}

	onVisibleValueChange(filterValue?: string | number | null) {
		const next = filterValue == null ? '' : String(filterValue);
		this.visibleValue.set(next);
		this.listFilterQuery.set(next);
	}

	selectFirstOption() {
		const committed = this.resolveValueOnCommit();
		this.changeHandler(committed);
		this.listFilterQuery.set(undefined);
		this.drop.closeHandler();
		this.input?.blurInput();
	}

	keydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			event.stopPropagation();
			this.selectFirstOption();
		}
	}

	private resolveValueOnCommit(): string | number {
		const typed = this.visibleValue().trim();
		const isFiltering = this.listFilterQuery() !== undefined;

		if (isFiltering && typed) {
			const filtered = this.autocompleteListFiltered().filter(item => !item.disabled);
			const usesCalendarNumber = this.filterFn() !== defaultFilterFn;

			if (usesCalendarNumber) {
				const byCalendarNumber = filtered.find(item => (+item.value + 1).toString() === typed);
				if (byCalendarNumber) {
					return byCalendarNumber.value;
				}
			}

			const exactInFiltered = filtered.find(item => String(item.key) === typed || String(item.value) === typed);
			if (exactInFiltered) {
				return exactInFiltered.value;
			}

			const first = filtered[0];
			if (first) {
				return first.value;
			}
			return typed;
		}

		return this.value();
	}

	openHandler() {
		this.isOpening = true;
		this.listFilterQuery.set(undefined);
		this.action.autocompleteOpened();
		this.drop.openHandler();
	}

	closeHandler() {
		const lookup = this.lastCommittedValue ?? this.value();
		const visible = getKeyByValue(this.autocompleteList(), lookup)?.toString() ?? this.visibleValue();
		this.visibleValue.set(visible);
		this.lastCommittedValue = null;
		this.listFilterQuery.set(undefined);
	}
}
