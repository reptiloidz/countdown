import { getPointDate } from './getPointDate';
import { Constants } from '../enums';
import { parse, addMinutes, subMinutes } from 'date-fns';

jest.mock('date-fns', () => ({
	...jest.requireActual('date-fns'),
	parse: jest.fn(),
	addMinutes: jest.fn(),
	subMinutes: jest.fn(),
}));

describe('getPointDate', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return the parsed date when datePart is provided', () => {
		const mockDate = new Date(2023, 11, 31);
		(parse as jest.Mock).mockReturnValue(mockDate);

		const result = getPointDate({ datePart: '31.12.2023' });

		expect(parse).toHaveBeenCalledWith('31.12.2023', Constants.shortDateFormat, expect.any(Date));
		expect(result).toBe(mockDate);
	});

	it('should add minutes to the pointDate when isGreenwich is true and tzOffset is positive', () => {
		const mockDate = new Date();
		(addMinutes as jest.Mock).mockReturnValue(mockDate);

		const result = getPointDate({ pointDate: mockDate, tzOffset: 60, isGreenwich: true });

		expect(addMinutes).toHaveBeenCalledWith(mockDate, 60);
		expect(result).toBe(mockDate);
	});

	it('should subtract minutes from the pointDate when isGreenwich is true and tzOffset is negative', () => {
		const mockDate = new Date();
		(subMinutes as jest.Mock).mockReturnValue(mockDate);

		const result = getPointDate({ pointDate: mockDate, tzOffset: -60, isGreenwich: true });

		expect(subMinutes).toHaveBeenCalledWith(mockDate, -60);
		expect(result).toBe(mockDate);
	});

	it('should return the parsed time when timePart is provided', () => {
		const mockDate = new Date(2023, 11, 31, 12, 0);
		(parse as jest.Mock).mockReturnValue(mockDate);

		const result = getPointDate({ timePart: '12:00', pointDate: new Date(2023, 11, 31) });

		expect(parse).toHaveBeenCalledWith('12:00', Constants.timeFormat, expect.any(Date));
		expect(result).toBe(mockDate);
	});

	it('should return the original pointDate when no datePart or timePart is provided', () => {
		const mockDate = new Date(2023, 11, 31);

		const result = getPointDate({ pointDate: mockDate });

		expect(result).toBe(mockDate);
	});

	it('should handle isInvert correctly when isGreenwich is true and tzOffset is positive', () => {
		const mockDate = new Date();
		(addMinutes as jest.Mock).mockReturnValue(mockDate);

		const result = getPointDate({ pointDate: mockDate, tzOffset: 60, isGreenwich: true, isInvert: true });

		expect(addMinutes).toHaveBeenCalledWith(mockDate, 60);
		expect(result).toBe(mockDate);
	});

	it('should handle isInvert correctly when isGreenwich is true and tzOffset is negative', () => {
		const mockDate = new Date();
		(addMinutes as jest.Mock).mockReturnValue(mockDate);

		const result = getPointDate({ pointDate: mockDate, tzOffset: -60, isGreenwich: true, isInvert: true });

		expect(addMinutes).toHaveBeenCalledWith(mockDate, -60);
		expect(result).toBe(mockDate);
	});
});
