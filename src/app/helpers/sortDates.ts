import { compareAsc, parse } from 'date-fns';
import { Point } from '../interfaces';
import { Constants } from '../enums';

export const sortDates = (point: Point) => {
	point.dates = point.dates.sort((a, b) =>
		compareAsc(
			parse(a.date, Constants.fullDateFormat, new Date()),
			parse(b.date, Constants.fullDateFormat, new Date())
		)
	);

	return point;
};
