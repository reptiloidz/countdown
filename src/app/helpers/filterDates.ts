import {
	isSameDay,
	isSameHour,
	isSameMinute,
	isSameMonth,
	parse,
} from 'date-fns';
import { Iteration, Point } from '../interfaces';
import { Constants } from '../enums';
import { CalendarMode } from '../types';

export const filterDates = (item: object) => {
	return item && typeof item === 'object' && !Array.isArray(item);
};

export const filterPoints = ({
	date,
	points,
	activeMode,
}: {
	date: Date;
	points: Point[];
	activeMode: CalendarMode;
}) => {
	return !points
		? []
		: points?.filter((item) => {
				return item.dates.some((iteration) =>
					findIterations({
						iteration,
						date,
						activeMode,
						greenwich: item.greenwich,
					})
				);
		  });
};

export const filterIterations = ({
	date,
	iterations,
	activeMode,
	greenwich = false,
}: {
	date: Date;
	iterations: Iteration[];
	activeMode: CalendarMode;
	greenwich: boolean;
}) => {
	return !iterations
		? []
		: iterations?.filter((iteration) =>
				findIterations({ iteration, date, activeMode, greenwich })
		  );
};

function findIterations({
	iteration,
	date,
	activeMode,
	greenwich = false,
}: {
	iteration: Iteration;
	date: Date;
	activeMode: CalendarMode;
	greenwich: boolean;
}) {
	let iterationDate = parse(
		iteration.date,
		Constants.fullDateFormat,
		new Date()
	);

	iterationDate = new Date(
		+iterationDate -
			(greenwich ? iterationDate.getTimezoneOffset() : 0) *
				Constants.msInMinute
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
