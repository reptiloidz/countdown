import { Pipe, PipeTransform } from '@angular/core';
import { Iteration } from '../interfaces';

@Pipe({
	name: 'sort',
})
export class SortPipe implements PipeTransform {
	transform(iterations: Iteration[] | undefined): Iteration[] | undefined {
		return (
			iterations &&
			iterations.sort((a, b) => {
				if (+new Date(a.date) > +new Date(b.date)) {
					return 1;
				} else {
					return -1;
				}
			})
		);
	}
}
