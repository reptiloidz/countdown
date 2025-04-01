import { Point } from '../interfaces/point.interface';

export const setIterationsMode = (point: Point) => {
	let isOdd = true;
	let prevDate!: string;

	point.modes?.length &&
		point.dates.map((iteration) => {
			isOdd = prevDate === iteration.date ? isOdd : !isOdd;
			iteration.mode = isOdd ? point.modes?.[1] : point.modes?.[0];
			prevDate = iteration.date;
			return iteration;
		});

	return point;
};
