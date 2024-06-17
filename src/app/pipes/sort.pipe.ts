// TODO: возможно, удаляем (сортировка делается без пайпа)

import { Pipe, PipeTransform } from '@angular/core';
import { Iteration } from '../interfaces';
import { compareAsc } from 'date-fns';
import { parseDate } from '../helpers';

@Pipe({
	name: 'sort',
})
export class SortPipe implements PipeTransform {
	transform(iterations: Iteration[] | undefined): Iteration[] | undefined {
		return (
			iterations &&
			iterations.sort((a, b) =>
				compareAsc(parseDate(a.date), parseDate(b.date))
			)
		);
	}
}
