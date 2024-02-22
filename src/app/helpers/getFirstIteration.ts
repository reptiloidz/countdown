import { Iteration, Point } from '../interfaces';

export const getFirstIteration = (iterations: Iteration[], point?: Point) => {
	return point?.dates.findIndex((item) => item.date === iterations[0]?.date);
};
