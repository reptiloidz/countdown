import { Iteration, Point } from '.';

export interface CalendarDate {
	date: Date;
	selectedDate: boolean;
	visibleDate: boolean;
	nowDate: boolean;
	points: Point[];
	iterations: Iteration[];
}
