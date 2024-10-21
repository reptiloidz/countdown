import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { getKeyByValue } from 'src/app/helpers';
import { Select } from 'src/app/interfaces';

@Component({
	selector: 'app-autocomplete',
	templateUrl: './autocomplete.component.html',
})
export class AutocompleteComponent implements OnInit {
	@Input() value: string | number = '';
	@Input() placeholder = '';
	@Input() autocompleteList!: Select;
	@Input() filterFn = (
		item: [string, string | number],
		filterValue: string
	) => item[0].includes(filterValue);

	autocompleteListFiltered!: Select;
	visibleValue: string | number = '';

	@Output() autocompleteChanged = new EventEmitter<string | number>();

	ngOnInit(): void {
		this.visibleValue =
			getKeyByValue(this.autocompleteList, this.value) || '';
		this.autocompleteListFiltered = this.autocompleteList;
	}

	changeHandler(value: string | number) {
		this.autocompleteChanged.emit(value);
		this.visibleValue =
			getKeyByValue(this.autocompleteList, value) || this.visibleValue;
		this.value = value;
	}

	filter(filterValue: string) {
		const autocompleteListFilteredArray = Object.entries(
			this.autocompleteList
		).filter((item) => this.filterFn(item, filterValue));

		this.autocompleteListFiltered = autocompleteListFilteredArray.length
			? autocompleteListFilteredArray.reduce((acc, [key, value]) => {
					acc[key] = value;
					return acc;
			  }, {} as { [key: string]: string | number })
			: this.autocompleteList;
	}
}
