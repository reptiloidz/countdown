import { addMinutes, parse, subMinutes } from 'date-fns';
import { Constants } from '../enums';

export const getPointDate = ({
	pointDate = new Date(),
	tzOffset = new Date().getTimezoneOffset(),
	isGreenwich = false,
	isInvert = false,
	datePart,
	timePart,
}: {
	pointDate?: Date;
	tzOffset?: number;
	isGreenwich?: boolean;
	isInvert?: boolean;
	datePart?: string;
	timePart?: string;
}): Date => {
	if (datePart) {
		pointDate = parse(
			datePart,
			Constants.shortDateFormat,
			getPointDate({
				tzOffset,
				isGreenwich,
				isInvert,
			}),
		);
	} else if (isGreenwich && (tzOffset > 0 || (tzOffset < 0 && isInvert))) {
		pointDate = addMinutes(pointDate, tzOffset);
	} else if (isGreenwich && (tzOffset < 0 || (tzOffset > 0 && isInvert))) {
		pointDate = subMinutes(pointDate, tzOffset);
	}

	return timePart
		? getPointDate({
				pointDate: parse(timePart, Constants.timeFormat, pointDate),
				tzOffset,
				isGreenwich,
				isInvert,
			})
		: pointDate;
};
