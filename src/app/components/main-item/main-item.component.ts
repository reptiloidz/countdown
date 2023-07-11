import { Component, Input } from '@angular/core';
import { Event } from 'src/app/interfaces/event.interface';

@Component({
	selector: '[app-main-item]',
	templateUrl: './main-item.component.html',
})
export class MainItemComponent {
	@Input() event!: Event;
}
