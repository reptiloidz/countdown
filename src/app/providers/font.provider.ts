export const FontProvider = () => () => {
	const fonts = [
		{
			family: 'Nimbus Mono',
			src: './assets/fonts/nimbus-mono/NimbusMono-Bold.woff2',
			options: {
				weight: '700',
				style: 'normal',
				display: 'swap' as FontDisplay,
			},
		},
		{
			family: 'Roboto Slab',
			src: './assets/fonts/roboto-slab/RobotoSlab-Black.woff2',
			options: {
				weight: '900',
				style: 'normal',
				display: 'swap' as FontDisplay,
			},
		},
		{
			family: 'Roboto Slab',
			src: './assets/fonts/roboto-slab/RobotoSlab-Medium.woff2',
			options: {
				weight: '500',
				style: 'normal',
				display: 'swap' as FontDisplay,
			},
		},
		{
			family: 'Roboto Slab',
			src: './assets/fonts/roboto-slab/RobotoSlab-Regular.woff2',
			options: {
				weight: '400',
				style: 'normal',
				display: 'swap' as FontDisplay,
			},
		},
		{
			family: 'Roboto Slab',
			src: './assets/fonts/roboto-slab/RobotoSlab-Light.woff2',
			options: {
				weight: '300',
				style: 'normal',
				display: 'swap' as FontDisplay,
			},
		},
	];

	const fontPromises = fonts.map(({ family, src, options }) => {
		const font = new FontFace(family, `url(${src})`, options);
		return font
			.load()
			.then(() => document.fonts.add(font))
			.catch(err => console.log(err));
	});

	return Promise.all(fontPromises);
};
