import { parseDate } from './parseDate';
import { Constants } from '../enums';
import { parse } from 'date-fns';

jest.mock('date-fns', () => ({
	parse: jest.fn(),
}));

describe('parseDate', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return a parsed date using fullDateFormat when no flags are set', () => {
		const dateStr = '2023-10-10';
		const expectedDate = new Date();
		(parse as jest.Mock).mockReturnValue(expectedDate);

		const result = parseDate(dateStr);

		expect(parse).toHaveBeenCalledWith(dateStr, Constants.fullDateFormat, expect.any(Date));
		expect(result).toBe(expectedDate);
	});

	it('should return a parsed date using fullDateUrlFormat when isURL is true and isTimer is false', () => {
		const dateStr = '2023-10-10';
		const expectedDate = new Date();
		(parse as jest.Mock).mockReturnValue(expectedDate);

		const result = parseDate(dateStr, true);

		expect(parse).toHaveBeenCalledWith(dateStr, Constants.fullDateUrlFormat, expect.any(Date));
		expect(result).toBe(expectedDate);
	});

	it('should return a parsed date using reallyFullDateFormat when isURL and isTimer are true', () => {
		const dateStr = '2023-10-10';
		const expectedDate = new Date();
		(parse as jest.Mock).mockReturnValue(expectedDate);

		const result = parseDate(dateStr, true, true);

		expect(parse).toHaveBeenCalledWith(dateStr, Constants.reallyFullDateFormat, expect.any(Date));
		expect(result).toBe(expectedDate);
	});

	it('should return the current date when no date string is provided', () => {
		const result = parseDate();

		expect(result).toBeInstanceOf(Date);
		expect(result.getTime()).toBeCloseTo(new Date().getTime(), -2);
	});
});
