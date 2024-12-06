import { Point } from '../interfaces';
import { getPointDate } from './getPointDate';
import { parseDate } from './parseDate';
import { setIterationsMode } from './setIterationsMode';
import { sortDates } from './sortDates';

export const getClosestIteration = (point: Point) => {
	point = setIterationsMode(sortDates(point));

	const datesFuture = point.dates
		.filter(
			(iteration) =>
				getPointDate({
					pointDate: parseDate(iteration.date),
					isGreenwich: point.greenwich,
				}) > new Date()
		)
		.sort();
	const datesPast = point.dates
		.filter(
			(iteration) =>
				getPointDate({
					pointDate: parseDate(iteration.date),
					isGreenwich: point.greenwich,
				}) < new Date()
		)
		.sort()
		.reverse();

	const resultIteration =
		point.direction === 'backward'
			? datesFuture[0] || datesPast[0]
			: datesPast[0] || datesFuture[0];
	const resultDate = resultIteration.date;

	return {
		date: getPointDate({
			pointDate: parseDate(resultDate),
			isGreenwich: point.greenwich,
		}),
		index: point.dates.findIndex((item) => item.date === resultDate),
		mode: resultIteration.mode,
	};
};
