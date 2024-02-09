export const generateUserpicName = (name: string) => {
	return name?.replaceAll(' ', '+');
};
