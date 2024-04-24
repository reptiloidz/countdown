import { Component, ContentChild, TemplateRef } from '@angular/core';

@Component({
	selector: '[app-tooltip]',
	templateUrl: './tooltip.component.html',
	host: {
		class: 'tooltip',
	},
})
export class TooltipComponent {
	@ContentChild('tooltipContent') tooltipContent:
		| TemplateRef<unknown>
		| undefined;
}
