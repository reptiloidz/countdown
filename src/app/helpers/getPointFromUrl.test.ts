import { getPointFromUrl } from './getPointFromUrl';
import { parseDate } from './parseDate';
import { addDays, addHours, addMinutes, addMonths, addWeeks, addYears, format } from 'date-fns';
import { Constants } from '../enums';

const mockDate = new Date(2023, 11, 31, 12, 41);
const mockDateFormat = '31.12.2023 12:41';

jest.mock('./parseDate', () => ({
	parseDate: jest.fn(),
}));

jest.mock('date-fns', () => ({
	...jest.requireActual('date-fns'),
	addDays: jest.fn(),
	addHours: jest.fn(),
	addMinutes: jest.fn(),
	addMonths: jest.fn(),
	addWeeks: jest.fn(),
	addYears: jest.fn(),
	format: jest.fn(),
}));

describe('getPointFromUrl', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return undefined if no date is provided and no other date-related fields are present', () => {
		const data = {};
		const result = getPointFromUrl(data);
		expect(result).toBeUndefined();
	});

	it('should parse the date if date is provided', () => {
		(parseDate as jest.Mock).mockReturnValue(mockDate);
		(format as jest.Mock).mockReturnValue(mockDateFormat);

		const result = getPointFromUrl({ date: '2023-12-31-12-41' });
		expect(parseDate).toHaveBeenCalledWith('2023-12-31-12-41', true);
		expect(result?.dates[0].date).toBeDefined();
	});

	it('should add years to the current date if years field is present', () => {
		(addYears as jest.Mock).mockReturnValue(mockDate);
		const data = { years: 1 };

		const result = getPointFromUrl(data);

		expect(addYears).toHaveBeenCalled();
		expect(result?.dates[0].date).toBeDefined();
	});

	it('should add months to the current date if months field is present', () => {
		(addMonths as jest.Mock).mockReturnValue(mockDate);
		const data = { months: 1 };

		const result = getPointFromUrl(data);

		expect(addMonths).toHaveBeenCalled();
		expect(result?.dates[0].date).toBeDefined();
	});

	it('should add weeks to the current date if weeks field is present', () => {
		(addWeeks as jest.Mock).mockReturnValue(mockDate);
		const data = { weeks: 1 };

		const result = getPointFromUrl(data);

		expect(addWeeks).toHaveBeenCalled();
		expect(result?.dates[0].date).toBeDefined();
	});

	it('should add days to the current date if days field is present', () => {
		(addDays as jest.Mock).mockReturnValue(mockDate);
		const data = { days: 1 };

		const result = getPointFromUrl(data);

		expect(addDays).toHaveBeenCalled();
		expect(result?.dates[0].date).toBeDefined();
	});

	it('should add hours to the current date if hours field is present', () => {
		(addHours as jest.Mock).mockReturnValue(mockDate);
		const data = { hours: 1 };

		const result = getPointFromUrl(data);

		expect(addHours).toHaveBeenCalled();
		expect(result?.dates[0].date).toBeDefined();
	});

	it('should add minutes to the current date if minutes field is present', () => {
		(addMinutes as jest.Mock).mockReturnValue(mockDate);
		const data = { minutes: 1 };

		const result = getPointFromUrl(data);

		expect(addMinutes).toHaveBeenCalled();
		expect(result?.dates[0].date).toBeDefined();
	});

	it('should format the date correctly', () => {
		(parseDate as jest.Mock).mockReturnValue(mockDate);
		(format as jest.Mock).mockReturnValue(mockDateFormat);
		const data = { date: '2023-12-31' };

		const result = getPointFromUrl(data);

		expect(format).toHaveBeenCalledWith(mockDate, Constants.fullDateFormat);
		expect(result?.dates[0].date).toBe(mockDateFormat);
	});

	it('should set the direction to forward if the date is in the past', () => {
		const mockDateLocal = new Date(+mockDate - 1000 * 60 * 60 * 24); // 1 day in the past
		(parseDate as jest.Mock).mockReturnValue(mockDateLocal);
		const data = { date: '2023-12-31' };

		const result = getPointFromUrl(data);

		expect(result?.direction).toBe('forward');
	});

	it('should set default values for color, title, and description if not provided', () => {
		(parseDate as jest.Mock).mockReturnValue(mockDate);
		const data = { date: '2023-12-31' };

		const result = getPointFromUrl(data);

		expect(result?.color).toBe('gray');
		expect(result?.title).toBe('');
		expect(result?.description).toBeNull();
	});

	it('should use provided values for color, title, and description if present', () => {
		(parseDate as jest.Mock).mockReturnValue(mockDate);
		const data = {
			date: '2023-12-31',
			color: 'red',
			title: 'Test Title',
			description: 'Test Description',
		};

		const result = getPointFromUrl(data);

		expect(result?.color).toBe('red');
		expect(result?.title).toBe('Test Title');
		expect(result?.description).toBe('Test Description');
	});
});
