import {
	AfterContentChecked,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	HostBinding,
	Input,
	OnChanges,
	OnDestroy,
	signal,
	SimpleChanges,
	TemplateRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActionService } from 'src/app/services';

@Component({
	selector: '[app-tooltip]',
	templateUrl: './tooltip.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent implements AfterViewInit, OnChanges, AfterContentChecked, OnDestroy {
	@ContentChild('tooltipContent') tooltipContent: TemplateRef<unknown> | undefined;
	@ContentChild('tooltipTrigger', { static: false }) triggerElement: any;

	@HostBinding('class') get dropClass() {
		return [
			'tooltip',
			'tooltip--' + this.vertical,
			'tooltip--' + this.horizontal,
			this.isTooltipOff() || !this.hasOnboardingTimeExpired() ? 'tooltip--disabled' : '',
			this.isOnboardingOn() ? 'tooltip--onboarding' : '',
		].join(' ');
	}
	@HostBinding('role') role = 'tooltip';

	@Input() vertical: 'top' | 'bottom' = 'bottom';
	@Input() horizontal: 'left' | 'right' = 'right';
	@Input() disabled = false;
	@Input() text!: string;
	@Input() onboarding!: string;
	@Input() onboardingBefore: string | null = null;
	@Input() onboardingTime = 500;

	hasOnboardingTimeExpired = signal(false);
	isOnboardingOn = signal(false);
	isTooltipOff = signal(false);
	private subscriptions = new Subscription();
	private onboardingTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(
		private action: ActionService,
		private cdr: ChangeDetectorRef,
	) {}

	ngAfterViewInit(): void {
		this.checkIsTooltipOff();
		this.onboardingUpdate();

		this.subscriptions.add(
			this.action.eventOnboardingClosed$.subscribe({
				next: () => {
					this.onboardingUpdate();
				},
			}),
		);
	}

	ngAfterContentChecked(): void {
		this.checkIsTooltipOff();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if ('disabled' in changes) {
			this.checkIsTooltipOff();
		}
		if ('disabled' in changes || 'onboarding' in changes || 'onboardingBefore' in changes) {
			this.onboardingUpdate();
		}
	}

	ngOnDestroy(): void {
		this.clearOnboardingTimer();
		if (this.isOnboardingOn()) {
			this.action.deactivateOnboarding(this.onboarding);
		}
		this.subscriptions.unsubscribe();
	}

	checkIsTooltipOff() {
		this.isTooltipOff.set(this.disabled || !this.triggerElement);
		this.cdr.markForCheck();
	}

	private clearOnboardingTimer(): void {
		if (this.onboardingTimer !== null) {
			clearTimeout(this.onboardingTimer);
			this.onboardingTimer = null;
		}
	}

	private isPreviousOnboardingDone(): boolean {
		if (this.onboardingBefore == null || this.onboardingBefore === '') {
			return true;
		}
		return localStorage.getItem(`onboarding-${this.onboardingBefore}`) === 'true';
	}

	private shouldShowOnboarding(): boolean {
		return (
			!!this.onboarding &&
			!this.isTooltipOff() &&
			localStorage.getItem(`onboarding-${this.onboarding}`) !== 'true' &&
			this.isPreviousOnboardingDone()
		);
	}

	onboardingUpdate() {
		this.clearOnboardingTimer();

		if (this.shouldShowOnboarding() && this.action.tryActivateOnboarding(this.onboarding)) {
			this.isOnboardingOn.set(true);
			this.hasOnboardingTimeExpired.set(false);
			this.onboardingTimer = setTimeout(() => {
				this.onboardingTimer = null;
				if (this.isOnboardingOn()) {
					this.hasOnboardingTimeExpired.set(true);
				}
				this.cdr.markForCheck();
			}, this.onboardingTime);
		} else {
			if (this.isOnboardingOn()) {
				this.action.deactivateOnboarding(this.onboarding);
			}
			this.isOnboardingOn.set(false);
			this.hasOnboardingTimeExpired.set(true);
		}
		this.cdr.markForCheck();
	}

	closeOnboarding() {
		localStorage.setItem(`onboarding-${this.onboarding}`, 'true');
		this.clearOnboardingTimer();
		this.isOnboardingOn.set(false);
		this.hasOnboardingTimeExpired.set(true);
		this.action.deactivateOnboarding(this.onboarding);
		this.action.onboardingClosed();
	}
}
