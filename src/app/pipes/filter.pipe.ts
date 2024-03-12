import { Pipe, PipeTransform } from '@angular/core';
import { Point } from '../interfaces';
import { FilterSelected } from '../types';

@Pipe({
	name: 'filter',
	pure: false,
})
export class FilterPipe implements PipeTransform {
	transform(
		points: Point[],
		{
			search = '',
			isRepeatable,
			isGreenwich,
			isPublic,
		}: {
			search: string;
			isRepeatable?: FilterSelected;
			isGreenwich?: FilterSelected;
			isPublic?: FilterSelected;
		}
	): Point[] {
		if (
			!search.length &&
			typeof isRepeatable === 'undefined' &&
			typeof isGreenwich === 'undefined' &&
			typeof isPublic === 'undefined'
		) {
			return points;
		} else {
			return points.filter((point) => {
				return (
					point.title
						.toLowerCase()
						.includes(search.toLowerCase().trim()) &&
					(point.repeatable.toString() === isRepeatable ||
						isRepeatable === 'all') &&
					(point.greenwich.toString() === isGreenwich ||
						isGreenwich === 'all') &&
					((point.public && point.public.toString() === isPublic) ||
						isPublic === 'all')
				);
			});
		}
	}
}
