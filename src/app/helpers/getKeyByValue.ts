import { Select, SelectArray } from 'src/app/interfaces';

export const getKeyByValue = (
	values: Select | SelectArray[],
	searchValue: string | number
) => {
	if (Array.isArray(values)) {
		return (values as SelectArray[]).find(
			(item) => item.value === searchValue
		)?.key;
	} else {
		for (const [key, value] of Object.entries(values)) {
			if (searchValue.toString() === value.toString()) {
				return key;
			}
		}
		return undefined;
	}
};
