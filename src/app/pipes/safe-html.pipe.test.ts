import { SafeHtmlPipe } from './safe-html.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

describe('SafeHtmlPipe', () => {
	let sanitizer: DomSanitizer;
	let pipe: SafeHtmlPipe;

	beforeEach(() => {
		sanitizer = {
			bypassSecurityTrustHtml: jest.fn((html: string) => `safe:${html}` as unknown as SafeHtml),
		} as unknown as DomSanitizer;

		pipe = new SafeHtmlPipe(sanitizer);
	});

	it('should sanitize HTML content', () => {
		const inputHtml = '<p>Hello <strong>world</strong></p>';
		const result = pipe.transform(inputHtml);

		expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(inputHtml);
		expect(result).toBe(`safe:${inputHtml}`);
	});
});
