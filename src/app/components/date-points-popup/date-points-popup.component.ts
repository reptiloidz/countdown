import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-date-points-popup',
	templateUrl: './date-points-popup.component.html',
})
export class DatePointsPopupComponent {
	@Input() points: any[] = [];
}
