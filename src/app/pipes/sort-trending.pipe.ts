import { Pipe, PipeTransform } from '@angular/core';
import { SortTypes } from '../types';

@Pipe({
	name: 'sortTrending',
	pure: false,
})
export class SortTrendingPipe implements PipeTransform {
	transform(sortType: SortTypes) {
		return sortType.includes('Asc')
			? {
					icon: 'trending-up',
					title: 'По возрастанию',
			  }
			: {
					icon: 'trending-down',
					title: 'По убыванию',
			  };
	}
}
