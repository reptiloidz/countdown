export const isObject = (item: object) => {
	return item && typeof item === 'object' && !Array.isArray(item);
};
