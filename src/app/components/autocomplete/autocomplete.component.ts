import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Select } from 'src/app/interfaces';

@Component({
	selector: 'app-autocomplete',
	templateUrl: './autocomplete.component.html',
})
export class AutocompleteComponent {
	@Input() value: string | number = '';
	@Input() placeholder = '';
	@Input() autocompleteList!: Select;

	@Output() autocompleteChanged = new EventEmitter<string | number>();

	changeHandler(value: string | number) {
		this.autocompleteChanged.emit(value);
		this.value = value;
	}
}
