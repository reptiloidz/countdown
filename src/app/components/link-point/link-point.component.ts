import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-link-point',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './link-point.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkPointComponent {
	pointId = input('');
	pointName = input('');
}
