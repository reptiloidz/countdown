export const isDateValid = (date: any) => {
	return !isNaN(Date.parse(date.toString()));
};
