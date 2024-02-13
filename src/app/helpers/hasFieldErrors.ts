import { ValidationObjectField } from '../interfaces';

export const hasFieldErrors = (field: ValidationObjectField) => {
	for (const key in field) {
		if (typeof field === 'object' && key !== 'dirty' && !field[key].value) {
			return field['dirty'];
		}
	}

	return false;
};
