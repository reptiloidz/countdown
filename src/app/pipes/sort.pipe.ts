// TODO: возможно, удаляем (сортировка делается без пайпа)

import { Pipe, PipeTransform } from '@angular/core';
import { Iteration } from '../interfaces';
import { compareAsc, parse } from 'date-fns';
import { Constants } from '../enums';

@Pipe({
	name: 'sort',
})
export class SortPipe implements PipeTransform {
	transform(iterations: Iteration[] | undefined): Iteration[] | undefined {
		return (
			iterations &&
			iterations.sort((a, b) =>
				compareAsc(
					parse(a.date, Constants.fullDateFormat, new Date()),
					parse(b.date, Constants.fullDateFormat, new Date())
				)
			)
		);
	}
}
