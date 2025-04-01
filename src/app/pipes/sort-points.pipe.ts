import { Pipe, PipeTransform } from '@angular/core';
import { Point } from '../interfaces';
import { SortService } from '../services/sort.service';
import { SortTypes } from '../types';

@Pipe({
	name: 'sortPoints',
})
export class SortPointsPipe implements PipeTransform {
	constructor(private sort: SortService) {}

	transform(points: Point[], sortType: SortTypes): Promise<Point[]> {
		return this.sort.sort(points, sortType);
	}
}
