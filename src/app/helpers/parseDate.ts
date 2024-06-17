import { parse } from 'date-fns';
import { Constants } from '../enums';

export const parseDate = (date: string): Date => {
	return parse(date, Constants.fullDateFormat, new Date());
};
