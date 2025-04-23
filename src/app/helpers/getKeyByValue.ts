import { SelectArray } from 'src/app/interfaces';

export const getKeyByValue = (values: SelectArray[], searchValue: string | number) => {
	return values?.find(item => item.value === searchValue)?.key;
};
