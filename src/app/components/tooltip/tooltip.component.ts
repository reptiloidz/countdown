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
	@Input() onboardingBefore!: string | null;
	@Input() onboardingTime = 500;

	hasOnboardingTimeExpired = signal(false);
	isOnboardingOn = signal(false);
	isTooltipOff = signal(false);
	private subscriptions = new Subscription();

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
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	checkIsTooltipOff() {
		this.isTooltipOff.set(this.disabled || !this.triggerElement);
		this.cdr.markForCheck();
	}

	onboardingUpdate() {
		if (
			localStorage.getItem(`onboarding-${this.onboarding}`) !== 'true' &&
			this.onboarding &&
			(localStorage.getItem(`onboarding-${this.onboardingBefore}`) === 'true' || !this.onboardingBefore)
		) {
			this.isOnboardingOn.set(true);
			setTimeout(() => {
				this.hasOnboardingTimeExpired.set(true);
				this.cdr.detectChanges();
			}, this.onboardingTime);
		} else {
			this.isOnboardingOn.set(false);
			this.hasOnboardingTimeExpired.set(true);
		}
	}

	closeOnboarding() {
		localStorage.setItem(`onboarding-${this.onboarding}`, 'true');
		this.isOnboardingOn.set(false);
		this.action.onboardingClosed();
	}
}
