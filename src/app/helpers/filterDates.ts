import { isSameDay, isSameHour, isSameMinute, isSameMonth } from 'date-fns';
import { Iteration, Point } from '../interfaces';
import { CalendarMode } from '../types';
import { parseDate } from './parseDate';
import { millisecondsInMinute } from 'date-fns/constants';

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
		: points?.filter(item => {
				return item.dates.some(iteration =>
					findIterations({
						iteration,
						date,
						activeMode,
						greenwich: item.greenwich,
					}),
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
	return !iterations ? [] : iterations?.filter(iteration => findIterations({ iteration, date, activeMode, greenwich }));
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
	let iterationDate = parseDate(iteration.date);

	iterationDate = new Date(+iterationDate - (greenwich ? iterationDate.getTimezoneOffset() : 0) * millisecondsInMinute);

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
