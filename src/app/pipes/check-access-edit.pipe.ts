import { inject, Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../services';
import { Point } from '../interfaces';

@Pipe({
	name: 'checkAccessEdit',
	standalone: true,
})
export class CheckAccessEditPipe implements PipeTransform {
	private readonly auth = inject(AuthService);

	transform(point: Point): boolean {
		return this.auth.checkAccessEdit(point);
	}
}
