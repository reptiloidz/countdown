import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../services';
import { Point } from '../interfaces';

@Pipe({
	name: 'checkAccessEdit',
})
export class CheckAccessEditPipe implements PipeTransform {
	constructor(private auth: AuthService) {}

	transform(point: Point): boolean {
		return this.auth.checkAccessEdit(point);
	}
}
