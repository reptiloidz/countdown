import { FontProvider } from './font.provider';

describe('FontProvider', () => {
	beforeEach(() => {
		// Mock the FontFace constructor and document.fonts.add method
		window.FontFace = jest.fn().mockImplementation((family, url, options) => ({
			family,
			url,
			options,
			load: jest.fn().mockResolvedValue(true),
		}));
		Object.defineProperty(document, 'fonts', {
			value: {
				add: jest.fn(),
			},
			writable: true,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should load and add fonts to the document', async () => {
		const fontProvider = FontProvider();
		await fontProvider();

		expect(window.FontFace).toHaveBeenCalledTimes(5);
		expect(document.fonts.add).toHaveBeenCalledTimes(5);

		expect(window.FontFace).toHaveBeenCalledWith(
			'Roboto Slab',
			'url(./assets/fonts/roboto-slab/RobotoSlab-Medium.woff2)',
			{ weight: '500', style: 'normal', display: 'swap' },
		);
		expect(window.FontFace).toHaveBeenCalledWith(
			'Roboto Slab',
			'url(./assets/fonts/roboto-slab/RobotoSlab-Regular.woff2)',
			{ weight: '400', style: 'normal', display: 'swap' },
		);
		expect(window.FontFace).toHaveBeenCalledWith(
			'Roboto Slab',
			'url(./assets/fonts/roboto-slab/RobotoSlab-Light.woff2)',
			{ weight: '300', style: 'normal', display: 'swap' },
		);
	});

	it('should handle font loading errors', async () => {
		const error = new Error('Failed to load font');
		window.FontFace = jest.fn().mockImplementation((family, url, options) => ({
			family,
			url,
			options,
			load: jest.fn().mockRejectedValue(error),
		}));
		console.log = jest.fn();

		const fontProvider = FontProvider();
		await fontProvider();

		expect(console.log).toHaveBeenCalledWith(error);
	});
});
