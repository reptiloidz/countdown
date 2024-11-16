import { Component, HostBinding } from '@angular/core';

@Component({
	selector: 'app-no-page',
	templateUrl: './no-page.component.html',
})
export class NoPageComponent {
	@HostBinding('class') class = 'no-page';
}
