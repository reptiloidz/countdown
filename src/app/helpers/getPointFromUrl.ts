import {
	addDays,
	addHours,
	addMinutes,
	addMonths,
	addWeeks,
	addYears,
	formatDate,
} from 'date-fns';
import { Point } from '../interfaces';
import { parseDate } from './parseDate';
import { Constants } from '../enums';

export const getPointFromUrl = (data: any): Point => {
	let dateParsed!: Date;

	if (data.date) {
		dateParsed = parseDate(data.date, true);
	} else {
		switch (true) {
			case !!data.years:
				dateParsed = addYears(new Date(), data.years);
				break;
			case !!data.months:
				dateParsed = addMonths(new Date(), data.months);
				break;
			case !!data.weeks:
				dateParsed = addWeeks(new Date(), data.weeks);
				break;
			case !!data.days:
				dateParsed = addDays(new Date(), data.days);
				break;
			case !!data.hours:
				dateParsed = addHours(new Date(), data.hours);
				break;
			case !!data.minutes:
				dateParsed = addMinutes(new Date(), data.minutes);
				break;
		}
	}

	const fullDate = formatDate(
		dateParsed,
		data.date ? Constants.fullDateFormat : Constants.reallyFullDateFormat
	);

	return {
		color: data.color || 'gray',
		title: data.title || '',
		description: data.description || null,
		dates: [
			{
				date:
					fullDate ||
					formatDate(
						new Date(),
						data.date
							? Constants.fullDateFormat
							: Constants.reallyFullDateFormat
					),
				reason: 'byHand',
			},
		],
		greenwich: false,
		repeatable: false,
		direction: fullDate && dateParsed > new Date() ? 'backward' : 'forward',
	};
};
