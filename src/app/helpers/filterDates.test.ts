import { filterPoints } from './filterDates';
import { CalendarMode } from '../types';
import { Point } from '../interfaces';

describe('filterPoints', () => {
	const date = new Date('2023-01-01T00:00:00Z');
	const points: Point[] = [
		{
			id: '1',
			title: 'Test point 1',
			color: 'red',
			dates: [{ date: '01.01.2023 00:00', reason: 'byHand' }],
			direction: 'backward',
			greenwich: true,
			repeatable: false,
		},
		{
			id: '2',
			title: 'Test point 2',
			color: 'red',
			dates: [{ date: '02.01.2023 00:00', reason: 'byHand' }],
			direction: 'backward',
			greenwich: true,
			repeatable: false,
		},
		{
			id: '3',
			title: 'Test point 3',
			color: 'red',
			dates: [{ date: '03.01.2023 00:00', reason: 'byHand' }],
			direction: 'backward',
			greenwich: true,
			repeatable: false,
		},
	];

	it('should return points that match the date in the specified mode', () => {
		const result = filterPoints({
			date,
			points,
			activeMode: 'month' as CalendarMode,
		});

		expect(result).toEqual([points[0]]);
	});

	it('should return an empty array if no points match the date', () => {
		const result = filterPoints({
			date: new Date('2023-09-30T00:00:00Z'),
			points,
			activeMode: 'month' as CalendarMode,
		});
		expect(result).toEqual([]);
	});

	it('should return an empty array if points is undefined', () => {
		const result = filterPoints({
			date,
			points: [],
			activeMode: 'day' as CalendarMode,
		});
		expect(result).toEqual([]);
	});

	it('should return an empty array if points is null', () => {
		const result = filterPoints({
			date,
			points: [],
			activeMode: 'day' as CalendarMode,
		});
		expect(result).toEqual([]);
	});

	it('should return points that match the date in year mode', () => {
		const result = filterPoints({
			date,
			points,
			activeMode: 'year' as CalendarMode,
		});
		expect(result).toEqual([points[0], points[1], points[2]]);
	});

	it('should return points that match the date in hour mode', () => {
		const result = filterPoints({
			date,
			points,
			activeMode: 'hour' as CalendarMode,
		});
		expect(result).toEqual([points[0]]);
	});

	it('should return points that match the date in minute mode', () => {
		const result = filterPoints({
			date,
			points,
			activeMode: 'minute' as CalendarMode,
		});
		expect(result).toEqual([points[0]]);
	});
});
