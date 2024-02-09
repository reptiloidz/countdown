export const randomHEXColor = () => {
	// Генерация случайного числа для каждого канала цвета (RGB)
	const red = Math.floor(Math.random() * 256);
	const green = Math.floor(Math.random() * 256);
	const blue = Math.floor(Math.random() * 256);

	// Преобразование чисел в формат HEX и объединение их в одну строку
	const hexColor = `${componentToHex(red)}${componentToHex(
		green
	)}${componentToHex(blue)}`;

	return hexColor;
};

function componentToHex(c: number) {
	const hex = c.toString(16);
	return hex.length == 1 ? '0' + hex : hex;
}
