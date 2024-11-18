import { parse } from 'date-fns';
import { Constants } from '../enums';

export const parseDate = (
	date: string,
	isURL = false,
	isTimer = false
): Date => {
	return parse(
		date,
		isURL
			? isTimer
				? Constants.reallyFullDateFormat
				: Constants.fullDateUrlFormat
			: Constants.fullDateFormat,
		new Date()
	);
};
