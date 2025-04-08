import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
	name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {
	constructor(private dom: DomSanitizer) {}

	transform(value: string): SafeHtml {
		return this.dom.bypassSecurityTrustHtml(value);
	}
}
