import { compareAsc } from 'date-fns';
import { Point } from '../interfaces/point.interface';
import { parseDate } from './parseDate';

export const sortDates = (point: Point) => {
	point.dates?.sort((a, b) =>
		compareAsc(parseDate(a.date), parseDate(b.date))
	);

	return point;
};
