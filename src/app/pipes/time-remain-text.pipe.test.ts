import { TimeRemainTextPipe } from './time-remain-text.pipe';
import { formatDistanceToNow } from 'date-fns';
import { getPointDate, parseDate } from '../helpers';
import { ru } from 'date-fns/locale';

jest.mock('date-fns', () => ({
	formatDistanceToNow: jest.fn(),
}));

jest.mock('../helpers', () => ({
	getPointDate: jest.fn(),
	parseDate: jest.fn(),
}));

describe('TimeRemainTextPipe', () => {
	let pipe: TimeRemainTextPipe;

	beforeEach(() => {
		pipe = new TimeRemainTextPipe();
	});

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should transform time to remaining time text', () => {
		const time = '2023-01-01T00:00:00Z';
		const parsedDate = new Date(time);
		const pointDate = new Date('2023-01-01T00:00:00Z');
		const formattedDistance = 'in 5 days';

		(parseDate as jest.Mock).mockReturnValue(parsedDate);
		(getPointDate as jest.Mock).mockReturnValue(pointDate);
		(formatDistanceToNow as jest.Mock).mockReturnValue(formattedDistance);

		const result = pipe.transform(time, true);

		expect(parseDate).toHaveBeenCalledWith(time);
		expect(getPointDate).toHaveBeenCalledWith({
			pointDate: parsedDate,
			isGreenwich: true,
		});
		expect(formatDistanceToNow).toHaveBeenCalledWith(pointDate, {
			locale: ru,
		});
		expect(result).toBe(formattedDistance);
	});

	it('should transform time to remaining time text without greenwich', () => {
		const time = '2023-01-01T00:00:00Z';
		const parsedDate = new Date(time);
		const pointDate = new Date('2023-01-01T00:00:00Z');
		const formattedDistance = 'in 5 days';

		(parseDate as jest.Mock).mockReturnValue(parsedDate);
		(getPointDate as jest.Mock).mockReturnValue(pointDate);
		(formatDistanceToNow as jest.Mock).mockReturnValue(formattedDistance);

		const result = pipe.transform(time);

		expect(parseDate).toHaveBeenCalledWith(time);
		expect(getPointDate).toHaveBeenCalledWith({
			pointDate: parsedDate,
			isGreenwich: undefined,
		});
		expect(formatDistanceToNow).toHaveBeenCalledWith(pointDate, {
			locale: ru,
		});
		expect(result).toBe(formattedDistance);
	});
});
