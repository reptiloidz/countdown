import { Iteration } from './iteration.interface';
import { Point } from './point.interface';

export interface CalendarDate {
	date: Date;
	selectedDate: boolean;
	visibleDate: boolean;
	nowDate: boolean;
	points: Point[];
	iterations: Iteration[];
}
