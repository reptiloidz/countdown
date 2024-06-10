import { parse } from 'date-fns';
import { Point } from '../interfaces';
import { Constants } from '../enums';

export const getClosestIteration = (point: Point) => {
	const datesFuture = point.dates
		.filter(
			(iteration) =>
				parse(iteration.date, Constants.fullDateFormat, new Date()) >
				new Date()
		)
		.sort();
	const datesPast = point.dates
		.filter(
			(iteration) =>
				parse(iteration.date, Constants.fullDateFormat, new Date()) <
				new Date()
		)
		.sort()
		.reverse();

	return (
		point.direction === 'backward'
			? datesFuture[0] || datesPast[0]
			: datesPast[0] || datesFuture[0]
	).date;
};
