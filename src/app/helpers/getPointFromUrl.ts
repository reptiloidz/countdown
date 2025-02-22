import { addDays, addHours, addMinutes, addMonths, addWeeks, addYears, format } from 'date-fns';
import { Point } from '../interfaces';
import { parseDate } from './parseDate';
import { Constants } from '../enums';

export const getPointFromUrl = (data: any): Point | undefined => {
	let dateParsed!: Date;

	if (data.date) {
		dateParsed = parseDate(data.date, true);
	} else {
		console.log(111);

		switch (true) {
			case !!data.years:
				dateParsed = addYears(new Date(), data.years * 1);
				break;
			case !!data.months:
				dateParsed = addMonths(new Date(), data.months * 1);
				break;
			case !!data.weeks:
				dateParsed = addWeeks(new Date(), data.weeks * 1);
				break;
			case !!data.days:
				dateParsed = addDays(new Date(), data.days * 1);
				break;
			case !!data.hours:
				dateParsed = addHours(new Date(), data.hours * 1);
				break;
			case !!data.minutes:
				dateParsed = addMinutes(new Date(), data.minutes * 1);
				break;
		}
	}

	if (!dateParsed) {
		return undefined;
	}

	const fullDate = format(dateParsed, data.date ? Constants.fullDateFormat : Constants.reallyFullDateFormat);

	return {
		color: data.color || 'gray',
		title: data.title || '',
		description: data.description || null,
		dates: [
			{
				date: fullDate || format(new Date(), data.date ? Constants.fullDateFormat : Constants.reallyFullDateFormat),
				reason: 'byHand',
			},
		],
		greenwich: false,
		repeatable: false,
		direction: fullDate && dateParsed > new Date() ? 'backward' : 'forward',
	};
};
