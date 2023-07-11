import { Component } from '@angular/core';
import { EditPointType } from '../edit-point/edit-point.component';

@Component({
	selector: 'app-create-point',
	templateUrl: './create-point.component.html',
	styles: [],
})
export class CreatePointComponent {
	create = EditPointType.Create;
}
