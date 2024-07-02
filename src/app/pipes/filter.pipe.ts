import { Pipe, PipeTransform } from '@angular/core';
import { Point } from '../interfaces';
import { Direction, FilterSelected } from '../types';

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
			direction,
			color,
		}: {
			search: string;
			isRepeatable?: FilterSelected;
			isGreenwich?: FilterSelected;
			isPublic?: FilterSelected;
			direction?: Direction | 'all';
			color?: string;
		}
	): Point[] {
		if (
			!search.length &&
			typeof isRepeatable === 'undefined' &&
			typeof isGreenwich === 'undefined' &&
			typeof isPublic === 'undefined' &&
			typeof direction === 'undefined' &&
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
					(point.public?.toString() === isPublic ||
						isPublic === 'all') &&
					(point.direction === direction || direction === 'all') &&
					(color?.split('+').includes(point.color || 'gray') ||
						color === '')
				);
			});
		}
	}
}
