import { Pipe, PipeTransform } from '@angular/core';
import { Point } from '../interfaces';

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
			isRepeatable?: boolean | undefined;
			isGreenwich?: boolean | undefined;
			isPublic?: boolean | undefined;
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
					(point.repeatable === isRepeatable ||
						typeof isRepeatable === 'undefined') &&
					(point.greenwich === isGreenwich ||
						typeof isGreenwich === 'undefined') &&
					(point.public === isPublic ||
						typeof isPublic === 'undefined')
				);
			});
		}
	}
}
