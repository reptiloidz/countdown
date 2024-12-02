import {
	Component,
	ContentChild,
	HostBinding,
	Input,
	TemplateRef,
} from '@angular/core';

@Component({
	selector: '[app-tooltip]',
	templateUrl: './tooltip.component.html',
})
export class TooltipComponent {
	@ContentChild('tooltipContent') tooltipContent:
		| TemplateRef<unknown>
		| undefined;
	@ContentChild('tooltipTrigger', { static: false }) triggerElement: any;

	@HostBinding('class') get dropClass() {
		return [
			'tooltip',
			'tooltip--' + this.vertical,
			'tooltip--' + this.horizontal,
			this.isTooltipOff && 'tooltip--disabled',
		].join(' ');
	}

	@Input() vertical: 'top' | 'bottom' = 'bottom';
	@Input() horizontal: 'left' | 'right' = 'right';
	@Input() disabled = false;
	@Input() text!: string;

	get isTooltipOff() {
		return this.disabled || !this.triggerElement;
	}
}
