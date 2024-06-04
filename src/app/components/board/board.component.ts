import { Component, HostBinding } from '@angular/core';

@Component({
	selector: 'app-board',
	templateUrl: './board.component.html',
})
export class BoardComponent {
	@HostBinding('class') class = 'board';
}
