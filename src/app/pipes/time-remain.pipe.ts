import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from 'date-fns';
import { getPointDate, parseDate } from '../helpers';
import { Constants } from '../enums';

@Pipe({
	name: 'timeRemain',
})
export class TimeRemainPipe implements PipeTransform {
	transform(time: string, greenwich?: boolean): string {
		const tzOffset = new Date().getTimezoneOffset();
		return formatDate(
			getPointDate({
				pointDate: parseDate(time),
				tzOffset,
				isGreenwich: greenwich,
			}),
			Constants.fullDateFormat
		);
	}
}
