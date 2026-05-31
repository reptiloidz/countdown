import {
	AfterContentChecked,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	effect,
	HostBinding,
	inject,
	input,
	OnDestroy,
	signal,
	TemplateRef,
	untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActionService } from 'src/app/services';
import { ButtonComponent } from '../button/button.component';

@Component({
	selector: '[app-tooltip]',
	standalone: true,
	imports: [CommonModule, ButtonComponent],
	templateUrl: './tooltip.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent implements AfterViewInit, AfterContentChecked, OnDestroy {
	private readonly action = inject(ActionService);
	private readonly cdr = inject(ChangeDetectorRef);

	@ContentChild('tooltipContent') tooltipContent: TemplateRef<unknown> | undefined;
	@ContentChild('tooltipTrigger', { static: false }) triggerElement: unknown;

	vertical = input<'top' | 'bottom'>('bottom');
	horizontal = input<'left' | 'right'>('right');
	disabled = input(false);
	text = input('');
	onboarding = input('');
	onboardingBefore = input<string | null>(null);
	onboardingTime = input(500);

	@HostBinding('class') get dropClass() {
		return [
			'tooltip',
			'tooltip--' + this.vertical(),
			'tooltip--' + this.horizontal(),
			this.isTooltipOff() || !this.hasOnboardingTimeExpired() ? 'tooltip--disabled' : '',
			this.isOnboardingOn() ? 'tooltip--onboarding' : '',
		].join(' ');
	}
	@HostBinding('role') role = 'tooltip';

	hasOnboardingTimeExpired = signal(false);
	isOnboardingOn = signal(false);
	isTooltipOff = signal(false);
	private subscriptions = new Subscription();
	private onboardingTimer: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		effect(() => {
			this.disabled();
			this.onboarding();
			this.onboardingBefore();
			untracked(() => {
				this.checkIsTooltipOff();
				this.onboardingUpdate();
			});
		});
	}

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

	ngOnDestroy(): void {
		this.clearOnboardingTimer();
		if (this.isOnboardingOn()) {
			this.action.deactivateOnboarding(this.onboarding());
		}
		this.subscriptions.unsubscribe();
	}

	checkIsTooltipOff() {
		this.isTooltipOff.set(this.disabled() || !this.triggerElement);
		this.cdr.markForCheck();
	}

	private clearOnboardingTimer(): void {
		if (this.onboardingTimer !== null) {
			clearTimeout(this.onboardingTimer);
			this.onboardingTimer = null;
		}
	}

	private isPreviousOnboardingDone(): boolean {
		const before = this.onboardingBefore();
		if (before == null || before === '') {
			return true;
		}
		return localStorage.getItem(`onboarding-${before}`) === 'true';
	}

	private shouldShowOnboarding(): boolean {
		const id = this.onboarding();
		return (
			!!id &&
			!this.isTooltipOff() &&
			localStorage.getItem(`onboarding-${id}`) !== 'true' &&
			this.isPreviousOnboardingDone()
		);
	}

	onboardingUpdate() {
		this.clearOnboardingTimer();

		if (this.shouldShowOnboarding() && this.action.tryActivateOnboarding(this.onboarding())) {
			this.isOnboardingOn.set(true);
			this.hasOnboardingTimeExpired.set(false);
			this.onboardingTimer = setTimeout(() => {
				this.onboardingTimer = null;
				if (this.isOnboardingOn()) {
					this.hasOnboardingTimeExpired.set(true);
				}
				this.cdr.markForCheck();
			}, this.onboardingTime());
		} else {
			if (this.isOnboardingOn()) {
				this.action.deactivateOnboarding(this.onboarding());
			}
			this.isOnboardingOn.set(false);
			this.hasOnboardingTimeExpired.set(true);
		}
		this.cdr.markForCheck();
	}

	closeOnboarding() {
		localStorage.setItem(`onboarding-${this.onboarding()}`, 'true');
		this.clearOnboardingTimer();
		this.isOnboardingOn.set(false);
		this.hasOnboardingTimeExpired.set(true);
		this.action.deactivateOnboarding(this.onboarding());
		this.action.onboardingClosed();
	}
}
