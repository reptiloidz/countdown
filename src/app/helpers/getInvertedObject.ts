export const getInvertedObject = (objectValue: { [key: string]: string }) => {
	return Object.entries(objectValue).reduce((acc, [key, value]) => {
		acc[value] = key;
		return acc;
	}, {} as { [key: string]: string });
};
