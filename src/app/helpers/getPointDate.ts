import { addMinutes, subMinutes } from 'date-fns';

export const getPointDate = (
	pointDate = new Date(),
	tzOffset = 0,
	isGreenwich = false,
	isInvert = false
) => {
	if (isGreenwich && (tzOffset > 0 || (tzOffset < 0 && isInvert))) {
		pointDate = addMinutes(pointDate, tzOffset);
	} else if (isGreenwich && (tzOffset < 0 || (tzOffset > 0 && isInvert))) {
		pointDate = subMinutes(pointDate, tzOffset);
	}
	return pointDate;
};
