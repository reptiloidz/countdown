/// <reference lib="webworker" />

import { setIterationsMode } from "../helpers/setIterationsMode";
import { sortDates } from "../helpers/sortDates";
import { getPointDate } from "../helpers/getPointDate";
import { parseDate } from '../helpers/parseDate';
import { Point } from "../interfaces/point.interface";
import { Iteration } from '../interfaces/iteration.interface';

addEventListener('message', ({ data }: { data: Point }) => {
	data = setIterationsMode(sortDates(data));

	const now = new Date();
	let closestFuture!: Iteration;
	let closestPast!: Iteration;

	data.dates.forEach(iteration => {
		const iterationDate = getPointDate({
			pointDate: parseDate(iteration.date),
			isGreenwich: data.greenwich,
		});

		if (iterationDate > now) {
			if (
				!closestFuture ||
				iterationDate <
					getPointDate({
						pointDate: parseDate(closestFuture.date),
						isGreenwich: data.greenwich,
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
						isGreenwich: data.greenwich,
					})
			) {
				closestPast = iteration;
			}
		}
	});

	const resultIteration: Iteration =
		data.direction === 'backward' ? closestFuture || closestPast : closestPast || closestFuture;

	const response = {
		date: getPointDate({
			pointDate: parseDate(resultIteration.date),
			isGreenwich: data.greenwich,
		}),
		index: data.dates.findIndex(item => item.date === resultIteration.date),
		mode: resultIteration.mode,
	};
	postMessage(response);
});
