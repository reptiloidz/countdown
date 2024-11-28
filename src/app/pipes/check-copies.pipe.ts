import { Pipe, PipeTransform } from '@angular/core';
import { Point } from '../interfaces';
import { checkCopies } from '../helpers';

@Pipe({
	name: 'checkCopies',
})
export class CheckCopiesPipe implements PipeTransform {
	transform(
		index: number,
		point: Point | undefined,
		comparePrev = false
	): boolean | undefined {
		return (
			point &&
			checkCopies(
				point,
				point?.dates[index],
				comparePrev ? index : undefined
			)
		);
	}
}
