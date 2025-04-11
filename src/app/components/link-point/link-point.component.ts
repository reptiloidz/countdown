import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
	selector: 'app-link-point',
	templateUrl: './link-point.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkPointComponent {
	@Input() pointId = '';
	@Input() pointName = '';
}
