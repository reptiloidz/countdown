import { Component, HostBinding } from '@angular/core';

@Component({
	selector: 'app-privacy',
	templateUrl: './privacy.component.html',
})
export class PrivacyComponent {
	@HostBinding('class') class = 'text-page';
}
