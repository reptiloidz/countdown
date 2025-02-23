import { Iteration, Point } from '../interfaces';

export const checkCopies = (point: Point, iteration: Iteration, currNumber?: number) => {
	if (currNumber && currNumber > 0) {
		return (
			!(point.dates[currNumber].date === point.dates[currNumber - 1].date) &&
			point.dates.filter(item => item.date === point.dates[currNumber - 1]?.date).length > 1
		);
	} else {
		return point.dates.filter(item => item?.date === iteration?.date).length > 1;
	}
};
