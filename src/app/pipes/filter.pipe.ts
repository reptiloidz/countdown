import { Pipe, PipeTransform } from '@angular/core';
import { Point } from '../interfaces';
import { FilterSelected } from '../types';

@Pipe({
	name: 'filter',
})
export class FilterPipe implements PipeTransform {
	transform(
		points: Point[],
		{
			search = '',
			isRepeatable,
			isGreenwich,
			isPublic,
			color,
		}: {
			search: string;
			isRepeatable?: FilterSelected;
			isGreenwich?: FilterSelected;
			isPublic?: FilterSelected;
			color?: string;
		}
	): Point[] {
		if (
			!search.length &&
			typeof isRepeatable === 'undefined' &&
			typeof isGreenwich === 'undefined' &&
			typeof isPublic === 'undefined' &&
			color === ''
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
						isPublic === 'all') &&
					(color?.split('+').includes(point.color || 'gray') ||
						color === '')
				);
			});
		}
	}
}
