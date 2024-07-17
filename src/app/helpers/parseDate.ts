import { parse } from 'date-fns';
import { Constants } from '../enums';

export const parseDate = (date: string, isURL = false): Date => {
	return parse(
		date,
		isURL ? Constants.fullDateUrlFormat : Constants.fullDateFormat,
		new Date()
	);
};
