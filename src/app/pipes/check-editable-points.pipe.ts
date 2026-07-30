import { inject, Pipe, PipeTransform } from '@angular/core';
import { Point } from '../interfaces';
import { AuthService } from '../services';

@Pipe({
	name: 'checkEditablePoints',
	standalone: true,
})
export class CheckEditablePointsPipe implements PipeTransform {
	private readonly auth = inject(AuthService);

	transform(points: Point[]): boolean {
		return points.some(point => this.auth.checkAccessEdit(point));
	}
}
