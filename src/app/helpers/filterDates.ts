import {
	isSameDay,
	isSameHour,
	isSameMinute,
	isSameMonth,
	parse,
} from 'date-fns';
import { CalendarMode, Iteration, Point } from '../interfaces';
import { Constants } from '../enums';

export const filterDates = (item: object) => {
	return item && typeof item === 'object' && !Array.isArray(item);
};

export const filterPoints = (
	date: Date,
	points: Point[],
	activeMode: CalendarMode
) => {
	return !points
		? []
		: points?.filter((item) => {
				return item.dates.some((iteration) =>
					findIterations(iteration, date, activeMode)
				);
		  });
};

export const filterIterations = (
	date: Date,
	iterations: Iteration[],
	activeMode: CalendarMode
) => {
	return !iterations
		? []
		: iterations?.filter((iteration) =>
				findIterations(iteration, date, activeMode)
		  );
};

function findIterations(
	iteration: Iteration,
	date: Date,
	activeMode: CalendarMode
) {
	const iterationDate = parse(
		iteration.date,
		Constants.fullDateFormat,
		new Date()
	);

	switch (activeMode) {
		case 'year':
			return isSameMonth(iterationDate, date);
		case 'day':
			return isSameHour(iterationDate, date);
		case 'hour':
			return isSameMinute(iterationDate, date);
		default:
			return isSameDay(iterationDate, date);
	}
}
