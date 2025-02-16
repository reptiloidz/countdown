import { Iteration, Point } from '../interfaces';
import { getPointDate } from './getPointDate';
import { parseDate } from './parseDate';
import { setIterationsMode } from './setIterationsMode';
import { sortDates } from './sortDates';

export const getClosestIteration = (point: Point, source?: string) => {
	point = setIterationsMode(sortDates(point));

	const now = new Date();
	let closestFuture!: Iteration;
	let closestPast!: Iteration;

	point.dates.forEach(iteration => {
		const iterationDate = getPointDate({
			pointDate: parseDate(iteration.date),
			isGreenwich: point.greenwich,
		});

		if (iterationDate > now) {
			if (
				!closestFuture ||
				iterationDate <
					getPointDate({
						pointDate: parseDate(closestFuture.date),
						isGreenwich: point.greenwich,
					})
			) {
				closestFuture = iteration;
			}
		} else {
			if (
				!closestPast ||
				iterationDate >
					getPointDate({
						pointDate: parseDate(closestPast.date),
						isGreenwich: point.greenwich,
					})
			) {
				closestPast = iteration;
			}
		}
	});

	const resultIteration: Iteration =
		point.direction === 'backward' ? closestFuture || closestPast : closestPast || closestFuture;

	return {
		date: getPointDate({
			pointDate: parseDate(resultIteration.date),
			isGreenwich: point.greenwich,
		}),
		index: point.dates.findIndex(item => item.date === resultIteration.date),
		mode: resultIteration.mode,
	};
};
