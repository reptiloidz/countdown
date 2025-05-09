import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	HostBinding,
	Input,
	signal,
	TemplateRef,
} from '@angular/core';

@Component({
	selector: '[app-tooltip]',
	templateUrl: './tooltip.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent implements AfterViewInit {
	@ContentChild('tooltipContent') tooltipContent: TemplateRef<unknown> | undefined;
	@ContentChild('tooltipTrigger', { static: false }) triggerElement: any;

	@HostBinding('class') get dropClass() {
		return [
			'tooltip',
			'tooltip--' + this.vertical,
			'tooltip--' + this.horizontal,
			this.isTooltipOff || !this.hasOnboardingTimeExpired() ? 'tooltip--disabled' : '',
			this.isOnboardingOn() ? 'tooltip--onboarding' : '',
		].join(' ');
	}

	@Input() vertical: 'top' | 'bottom' = 'bottom';
	@Input() horizontal: 'left' | 'right' = 'right';
	@Input() disabled = false;
	@Input() text!: string;
	@Input() onboarding!: string;
	@Input() onboardingBefore!: string | null;
	@Input() onboardingTime = 500;

	hasOnboardingTimeExpired = signal(false);
	isOnboardingOn = signal(false);

	ngAfterViewInit(): void {
		if (
			localStorage.getItem(`onboarding-${this.onboarding}`) !== 'true' &&
			this.onboarding &&
			(localStorage.getItem(`onboarding-${this.onboardingBefore}`) === 'true' || !this.onboardingBefore)
		) {
			this.isOnboardingOn.set(true);
			setTimeout(() => {
				this.hasOnboardingTimeExpired.set(true);
			}, this.onboardingTime);
		} else {
			this.isOnboardingOn.set(false);
			this.hasOnboardingTimeExpired.set(true);
		}
	}

	get isTooltipOff() {
		return this.disabled || !this.triggerElement;
	}

	closeOnboarding() {
		localStorage.setItem(`onboarding-${this.onboarding}`, 'true');
		this.isOnboardingOn.set(false);
	}
}
