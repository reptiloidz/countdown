import { ValidationObject } from '../interfaces';

export const getErrorMessages = (validationObject: ValidationObject) => {
	let errorMessages: string[] = [];

	const processObject = (obj: ValidationObject): void => {
		for (const key in obj) {
			const field: any = obj[key];

			if (typeof field === 'object' && 'dirty' in field && field.dirty) {
				for (const subKey in field) {
					if (
						subKey !== 'dirty' &&
						!field[subKey].value &&
						field[subKey].message
					) {
						errorMessages.push(field[subKey].message);
					}
				}
			} else if (typeof field === 'object') {
				processObject(field);
			}
		}
	};
	processObject(validationObject);

	return errorMessages;
};
