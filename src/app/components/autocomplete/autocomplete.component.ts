import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core';
import { getKeyByValue } from 'src/app/helpers';
import { SelectArray } from 'src/app/interfaces';
import { DropComponent } from '../drop/drop.component';
import { InputComponent } from '../input/input.component';
import { ActionService } from 'src/app/services';
import { Subscription } from 'rxjs';
import { IConfig } from 'ngx-mask';

@Component({
	selector: 'app-autocomplete',
	templateUrl: './autocomplete.component.html',
})
export class AutocompleteComponent implements OnInit, OnDestroy {
	@Input() value: string | number = '';
	@Input() visibleValue: string | number = '';
	@Input() placeholder = '';
	@Input() autocompleteList!: SelectArray[];
	@Input() mask: string | null = null;
	@Input() patterns!: IConfig['patterns'];
	@Input() suffix: string = '';
	@Input() prefix: string = '';
	@Input() filterFn = (item: SelectArray, filterValue: string) =>
		item.value.toString().includes(filterValue);
	@Input() dataSuffix = '';

	autocompleteListFiltered!: SelectArray[];

	private firstFilteredValue!: SelectArray;
	private subscriptions = new Subscription();
	private isOpening = false;

	@Output() autocompleteChanged = new EventEmitter<string | number>();

	@ViewChild(DropComponent) drop!: DropComponent;
	@ViewChild(InputComponent) input!: InputComponent;

	constructor(private action: ActionService) {}

	ngOnInit(): void {
		this.visibleValue =
			getKeyByValue(this.autocompleteList, this.value) || '';
		this.autocompleteListFiltered = this.autocompleteList;

		this.subscriptions.add(
			this.action.eventAutocompleteOpened$.subscribe({
				next: () => {
					!this.isOpening && this.drop.closeHandler();
					this.isOpening = false;
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	changeHandler(value: string | number) {
		this.autocompleteChanged.emit(value);
		this.visibleValue =
			getKeyByValue(this.autocompleteList, value) || this.visibleValue;
		this.value = value;
	}

	filter(filterValue?: string) {
		const autocompleteListFilteredArray = filterValue
			? this.autocompleteList.filter((item) =>
					this.filterFn(item, filterValue)
			  )
			: this.autocompleteList;

		this.firstFilteredValue = autocompleteListFilteredArray[0];
		this.autocompleteListFiltered = autocompleteListFilteredArray.length
			? autocompleteListFilteredArray
			: this.autocompleteList;
	}

	selectFirstOption() {
		this.drop.closeHandler();
		this.input.blurInput();
		this.changeHandler(
			this.firstFilteredValue ? this.firstFilteredValue.value : this.value
		);
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
		this.visibleValue =
			getKeyByValue(this.autocompleteList, this.value) ||
			this.visibleValue;
	}
}
