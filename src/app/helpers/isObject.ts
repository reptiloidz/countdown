export const isObject = (item: unknown) => {
	return item && typeof item === 'object' && !Array.isArray(item);
};
