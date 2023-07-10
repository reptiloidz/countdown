import { Component, Input, OnInit } from '@angular/core';

export enum EditEventType {
	Create = 'create',
	Edit = 'edit',
}

@Component({
	selector: 'app-edit-event',
	templateUrl: './edit-event.component.html',
	styles: [],
})
export class EditEventComponent implements OnInit {
	@Input() type = EditEventType.Edit;

	ngOnInit(): void {
		if (!this.isCreation) {
		}
	}

	get isCreation() {
		return this.type === EditEventType.Create;
	}
}
