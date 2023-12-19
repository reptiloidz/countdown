import { addMinutes, parse, subMinutes } from 'date-fns';
import { Constants } from '../enums';

export const getPointDate = (
	pointDate = new Date(),
	tzOffset = 0,
	isGreenwich = false,
	isInvert = false,
	valueArray?: string[]
): Date => {
	if (valueArray) {
		pointDate = parse(
			valueArray[1],
			Constants.shortDateFormat,
			getPointDate(new Date(), tzOffset, isGreenwich, isInvert)
		);
	} else {
		if (isGreenwich && (tzOffset > 0 || (tzOffset < 0 && isInvert))) {
			pointDate = addMinutes(pointDate, tzOffset);
		} else if (
			isGreenwich &&
			(tzOffset < 0 || (tzOffset > 0 && isInvert))
		) {
			pointDate = subMinutes(pointDate, tzOffset);
		}
	}

	return valueArray
		? getPointDate(
				parse(valueArray[0], Constants.timeFormat, pointDate),
				tzOffset,
				isGreenwich,
				isInvert
		  )
		: pointDate;
};
