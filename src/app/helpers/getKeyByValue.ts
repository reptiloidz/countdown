import { Select } from 'src/app/interfaces';

export const getKeyByValue = (
	arrayOfValues: Select,
	searchValue: string | number
) => {
	for (const [key, value] of Object.entries(arrayOfValues)) {
		if (searchValue.toString() === value.toString()) {
			return key;
		}
	}
	return undefined;
};
