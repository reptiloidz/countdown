import { TimeRemainPipe } from './time-remain.pipe';
import { formatDate } from 'date-fns';
import { getPointDate, parseDate } from '../helpers';
import { Constants } from '../enums';

jest.mock('date-fns', () => ({
	formatDate: jest.fn(),
}));

jest.mock('../helpers', () => ({
	getPointDate: jest.fn(),
	parseDate: jest.fn(),
}));

describe('TimeRemainPipe', () => {
	let pipe: TimeRemainPipe;

	beforeEach(() => {
		pipe = new TimeRemainPipe();
	});

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should transform time to formatted date string', () => {
		const time = '2023-01-01T00:00:00Z';
		const parsedDate = new Date(time);
		const pointDate = new Date('2023-01-01T00:00:00Z');
		const formattedDate = '01.01.2023';

		(parseDate as jest.Mock).mockReturnValue(parsedDate);
		(getPointDate as jest.Mock).mockReturnValue(pointDate);
		(formatDate as jest.Mock).mockReturnValue(formattedDate);

		const result = pipe.transform(time, true);

		expect(parseDate).toHaveBeenCalledWith(time);
		expect(getPointDate).toHaveBeenCalledWith({
			pointDate: parsedDate,
			isGreenwich: true,
		});
		expect(formatDate).toHaveBeenCalledWith(pointDate, Constants.fullDateFormat);
		expect(result).toBe(formattedDate);
	});

	it('should transform time to formatted date string without greenwich', () => {
		const time = '2023-01-01T00:00:00Z';
		const parsedDate = new Date(time);
		const pointDate = new Date('2023-01-01T00:00:00Z');
		const formattedDate = '01.01.2023';

		(parseDate as jest.Mock).mockReturnValue(parsedDate);
		(getPointDate as jest.Mock).mockReturnValue(pointDate);
		(formatDate as jest.Mock).mockReturnValue(formattedDate);

		const result = pipe.transform(time);

		expect(parseDate).toHaveBeenCalledWith(time);
		expect(getPointDate).toHaveBeenCalledWith({
			pointDate: parsedDate,
			isGreenwich: undefined,
		});
		expect(formatDate).toHaveBeenCalledWith(pointDate, Constants.fullDateFormat);
		expect(result).toBe(formattedDate);
	});
});
