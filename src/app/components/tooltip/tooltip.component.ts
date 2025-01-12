import { Component, ContentChild, HostBinding, Input, TemplateRef } from '@angular/core';

@Component({
	selector: '[app-tooltip]',
	templateUrl: './tooltip.component.html',
})
export class TooltipComponent {
	@ContentChild('tooltipContent') tooltipContent: TemplateRef<unknown> | undefined;
	@ContentChild('tooltipTrigger', { static: false }) triggerElement: any;

	@HostBinding('class') get dropClass() {
		return [
			'tooltip',
			'tooltip--' + this.vertical,
			'tooltip--' + this.horizontal,
			this.isTooltipOff && 'tooltip--disabled',
			this.isOnboardingOn && 'tooltip--onboarding',
		].join(' ');
	}

	@Input() vertical: 'top' | 'bottom' = 'bottom';
	@Input() horizontal: 'left' | 'right' = 'right';
	@Input() disabled = false;
	@Input() text!: string;
	@Input() onboarding!: string;
	@Input() onboardingBefore!: string;

	get isTooltipOff() {
		return this.disabled || !this.triggerElement;
	}

	get isOnboardingOn() {
		return (
			localStorage.getItem(`onboarding-${this.onboarding}`) !== 'true' &&
			this.onboarding &&
			(localStorage.getItem(`onboarding-${this.onboardingBefore}`) === 'true' || !this.onboardingBefore)
		);
	}

	closeOnboarding() {
		localStorage.setItem(`onboarding-${this.onboarding}`, 'true');
	}
}
