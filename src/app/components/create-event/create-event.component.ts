import { Component } from '@angular/core';
import { EditEventType } from '../edit-event/edit-event.component';

@Component({
	selector: 'app-create-event',
	templateUrl: './create-event.component.html',
	styles: [],
})
export class CreateEventComponent {
	create = EditEventType.Create;
}
