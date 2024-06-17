import { Point } from '../interfaces';
import { parseDate } from './parseDate';

export const getClosestIteration = (point: Point) => {
	const datesFuture = point.dates
		.filter((iteration) => parseDate(iteration.date) > new Date())
		.sort();
	const datesPast = point.dates
		.filter((iteration) => parseDate(iteration.date) < new Date())
		.sort()
		.reverse();

	const resultDate = (
		point.direction === 'backward'
			? datesFuture[0] || datesPast[0]
			: datesPast[0] || datesFuture[0]
	).date;

	return {
		date: resultDate,
		index: point.dates.findIndex((item) => item.date === resultDate),
	};
};
