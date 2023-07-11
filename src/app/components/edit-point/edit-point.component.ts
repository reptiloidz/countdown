import { Component, Input, OnInit } from '@angular/core';

export enum EditPointType {
	Create = 'create',
	Edit = 'edit',
}

@Component({
	selector: 'app-edit-point',
	templateUrl: './edit-point.component.html',
	styles: [],
})
export class EditPointComponent implements OnInit {
	@Input() type = EditPointType.Edit;

	ngOnInit(): void {
		if (!this.isCreation) {
		}
	}

	get isCreation() {
		return this.type === EditPointType.Create;
	}
}
