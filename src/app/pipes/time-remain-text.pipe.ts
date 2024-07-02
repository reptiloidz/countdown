import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';
import { getPointDate, parseDate } from '../helpers';
import { ru } from 'date-fns/locale';

@Pipe({
	name: 'timeRemainText',
})
export class TimeRemainTextPipe implements PipeTransform {
	transform(time: string, greenwich?: boolean): string {
		return formatDistanceToNow(
			getPointDate({
				pointDate: parseDate(time),
				isGreenwich: greenwich,
			}),
			{
				locale: ru,
			}
		);
	}
}
