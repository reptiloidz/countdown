import { Iteration, Point } from '../interfaces';

export const checkCopies = (point: Point, iteration: Iteration) => {
	return (
		point.dates.filter((item) => item.date === iteration.date).length > 1
	);
};
