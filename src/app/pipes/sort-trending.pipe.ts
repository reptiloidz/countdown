import { Pipe, PipeTransform } from '@angular/core';
import { SortTypes } from '../types';

@Pipe({
	name: 'sortTrending',
})
export class SortTrendingPipe implements PipeTransform {
	transform(sortType: SortTypes): { icon: string; title: string } {
		return sortType.includes('Asc')
			? {
					icon: 'arrow-small-up',
					title: 'По возрастанию',
			  }
			: {
					icon: 'arrow-small-down',
					title: 'По убыванию',
			  };
	}
}
