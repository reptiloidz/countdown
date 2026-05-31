import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
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

@Component({
	selector: 'app-autocomplete',
	standalone: true,
	imports: [CommonModule, FormsModule, DropComponent, InputComponent],
	templateUrl: './autocomplete.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteComponent implements OnInit, OnChanges, OnDestroy {
	@Input() value: string | number = '';
	@Input() visibleValue: string = '';
	@Input() placeholder = '';
	@Input() inputmode: string | null = null;
	@Input() autocompleteList!: SelectArray[];
	@Input() mask: string | null = null;
	@Input() patterns!: NgxMaskConfig['patterns'];
	@Input() suffix: string = '';
	@Input() prefix: string = '';
	@Input() filterFn = (item: SelectArray, filterValue: string) =>
		item.value.toString().includes(filterValue) && !item.disabled;
	@Input() dataSuffix = '';
	@Input() autofocus = false;

	autocompleteListFiltered!: SelectArray[];

	firstFilteredValue!: SelectArray;
	private subscriptions = new Subscription();
	isOpening = false;

	@Output() autocompleteChanged = new EventEmitter<string | number>();

	@ViewChild(DropComponent, { static: true }) drop!: DropComponent;

	constructor(
		private action: ActionService,
		private cdr: ChangeDetectorRef,
	) {}

	ngOnInit(): void {
		this.syncVisibleValue();
		this.autocompleteListFiltered = this.autocompleteList;

		this.subscriptions.add(
			this.action.eventAutocompleteOpened$.pipe(filter(() => this.isOpening)).subscribe({
				next: () => {
					!this.isOpening && this.drop.closeHandler();
					this.isOpening = false;
				},
			}),
		);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['value'] || changes['visibleValue'] || changes['autocompleteList']) {
			this.syncVisibleValue();
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	private syncVisibleValue(): void {
		this.visibleValue = getKeyByValue(this.autocompleteList, this.value)?.toString() ?? this.visibleValue;
	}

	changeHandler(value: string | number) {
		this.autocompleteChanged.emit(value);
		this.visibleValue = getKeyByValue(this.autocompleteList, value)?.toString() ?? this.visibleValue;
		this.value = value;
	}

	onVisibleValueChange(filterValue?: string | number | null) {
		this.visibleValue = filterValue == null ? '' : String(filterValue);
		this.filter(this.visibleValue);
	}

	filter(filterValue?: string | number) {
		const filterString = filterValue?.toString();
		const autocompleteListFilteredArray = filterString
			? this.autocompleteList.filter(item => this.filterFn(item, filterString))
			: this.autocompleteList;

		this.firstFilteredValue = autocompleteListFilteredArray[0];
		this.autocompleteListFiltered = autocompleteListFilteredArray.length
			? autocompleteListFilteredArray
			: this.autocompleteList;
		this.cdr.markForCheck();
	}

	selectFirstOption() {
		this.drop.closeHandler();
		(document.activeElement as HTMLElement | null)?.blur();
		this.changeHandler(this.firstFilteredValue ? this.firstFilteredValue.value : this.value);
		this.autocompleteListFiltered = this.autocompleteList;
	}

	keydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			this.selectFirstOption();
		}
	}

	openHandler() {
		this.isOpening = true;
		this.action.autocompleteOpened();
		this.filter();
		this.drop.openHandler();
	}

	closeHandler() {
		this.visibleValue = getKeyByValue(this.autocompleteList, this.value)?.toString() ?? this.visibleValue;
	}
}
