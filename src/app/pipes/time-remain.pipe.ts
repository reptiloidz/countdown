import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';
import { parseDate } from '../helpers';
import { ru } from 'date-fns/locale';

@Pipe({
	name: 'timeRemain',
})
export class TimeRemainPipe implements PipeTransform {
	transform(time: string): string {
		return formatDistanceToNow(parseDate(time), {
			locale: ru,
		});
	}
}
