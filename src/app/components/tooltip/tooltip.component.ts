import {
	Component,
	ContentChild,
	HostBinding,
	Input,
	TemplateRef,
} from '@angular/core';
import { DropHorizontal, DropVertical } from 'src/app/types';

@Component({
	selector: '[app-tooltip]',
	templateUrl: './tooltip.component.html',
})
export class TooltipComponent {
	@ContentChild('tooltipContent') tooltipContent:
		| TemplateRef<unknown>
		| undefined;

	@HostBinding('class') get dropClass() {
		return [
			'tooltip',
			'tooltip--' + this.vertical,
			'tooltip--' + this.horizontal,
		].join(' ');
	}

	@Input() vertical: DropVertical = 'bottom';
	@Input() horizontal: DropHorizontal = 'left';
}
