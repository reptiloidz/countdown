import { Pipe, PipeTransform } from '@angular/core';
import { Point } from '../interfaces';
import { AuthService } from '../services';

@Pipe({
	name: 'checkEditablePoints',
})
export class CheckEditablePointsPipe implements PipeTransform {
	constructor(private auth: AuthService) {}

	transform(points: Point[]): boolean {
		return points.some((point) => this.auth.checkAccessEdit(point));
	}
}
