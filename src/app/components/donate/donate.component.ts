import { Component, HostBinding } from '@angular/core';

@Component({
	selector: 'app-donate',
	standalone: true,
	templateUrl: './donate.component.html',
})
export class DonateComponent {
	@HostBinding('class') class = 'donate';
}
