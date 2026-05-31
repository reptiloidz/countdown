import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActionService } from 'src/app/services';

@Component({
	imports: [TooltipComponent],
	template: `
		<div
			app-tooltip
			[text]="text"
			[onboarding]="onboarding"
			[vertical]="vertical"
			[horizontal]="horizontal"
			[disabled]="disabled"
		>
			<span #tooltipTrigger>Trigger</span>
		</div>

		<ng-template #tooltipContent>Custom Content</ng-template>
	`,
})
class TestHostComponent {
	text = 'Test tooltip';
	onboarding = 'testOnboarding';
	vertical: 'top' | 'bottom' = 'bottom';
	horizontal: 'left' | 'right' = 'right';
	disabled = false;

	@ViewChild(TooltipComponent) tooltipComponent!: TooltipComponent;
	@ViewChild('tooltipContent', { static: true }) tooltipContent!: TemplateRef<unknown>;
}

@Component({
	imports: [TooltipComponent],
	template: `
		<div app-tooltip onboarding="second" [onboardingBefore]="'first'" text="Second">
			<span #tooltipTrigger>Second</span>
		</div>
		<div app-tooltip onboarding="first" text="First">
			<span #tooltipTrigger>First</span>
		</div>
	`,
})
class SequentialHostComponent {}

describe('TooltipComponent', () => {
	let component: TooltipComponent;
	let fixture: ComponentFixture<TestHostComponent>;
	let hostComponent: TestHostComponent;
	let action: ActionService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TooltipComponent],
			declarations: [TestHostComponent, SequentialHostComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		localStorage.clear();
		fixture = TestBed.createComponent(TestHostComponent);
		hostComponent = fixture.componentInstance;
		action = TestBed.inject(ActionService);
		fixture.detectChanges();
		component = hostComponent.tooltipComponent;
	});

	afterEach(() => {
		localStorage.clear();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should apply correct classes based on inputs', () => {
		hostComponent.vertical = 'top';
		hostComponent.horizontal = 'left';
		fixture.detectChanges();
		expect(component.dropClass).toContain('tooltip--top');
		expect(component.dropClass).toContain('tooltip--left');
	});

	it('should disable tooltip when triggerElement is missing', () => {
		component.triggerElement = undefined;
		component.checkIsTooltipOff();
		fixture.detectChanges();
		expect(component.isTooltipOff()).toBeTruthy();
	});

	it('should show tooltip content if provided', () => {
		component.tooltipContent = hostComponent.tooltipContent;
		component.hasOnboardingTimeExpired.set(true);
		fixture.detectChanges();
		const tooltipBody = fixture.debugElement.query(By.css('.tooltip__body'));
		expect(tooltipBody).toBeTruthy();
	});

	it('should use text input if no template is provided', () => {
		component.hasOnboardingTimeExpired.set(true);
		fixture.detectChanges();
		const tooltipText = fixture.debugElement.query(By.css('.tooltip__content'));
		expect(tooltipText.nativeElement.textContent).toContain('Test tooltip');
	});

	it('should mark onboarding as completed when close button is clicked', () => {
		component.isOnboardingOn.set(true);
		component.hasOnboardingTimeExpired.set(true);
		localStorage.setItem('onboarding-testOnboarding', 'false');
		fixture.detectChanges();

		const closeButton = fixture.debugElement.query(By.css('.tooltip__close'));
		closeButton.triggerEventHandler('click', null);
		fixture.detectChanges();

		expect(localStorage.getItem('onboarding-testOnboarding')).toBe('true');
	});

	it('should not start onboarding when disabled', () => {
		hostComponent.onboarding = 'disabledOnboarding';
		hostComponent.disabled = true;
		component.checkIsTooltipOff();
		component.onboardingUpdate();
		fixture.detectChanges();

		expect(component.isOnboardingOn()).toBe(false);
		expect(component.dropClass).not.toContain('tooltip--onboarding');
	});

	it('should show only one onboarding in a chain at a time', () => {
		fixture.destroy();
		const seqFixture = TestBed.createComponent(SequentialHostComponent);
		seqFixture.detectChanges();

		const tooltips = seqFixture.debugElement.queryAll(By.directive(TooltipComponent));
		const second = tooltips[0].componentInstance as TooltipComponent;
		const first = tooltips[1].componentInstance as TooltipComponent;

		expect(first.isOnboardingOn()).toBe(true);
		expect(second.isOnboardingOn()).toBe(false);

		first.closeOnboarding();
		seqFixture.detectChanges();

		expect(second.isOnboardingOn()).toBe(true);
		expect(localStorage.getItem('onboarding-first')).toBe('true');

		seqFixture.destroy();
	});

	it('should release active onboarding slot on close', () => {
		fixture.destroy();
		const slotFixture = TestBed.createComponent(TestHostComponent);
		slotFixture.detectChanges();
		const slotComponent = slotFixture.componentInstance.tooltipComponent;
		action.deactivateOnboarding('testOnboarding');

		slotFixture.componentInstance.onboarding = 'slotA';
		slotFixture.detectChanges();
		slotComponent.checkIsTooltipOff();
		slotComponent.onboardingUpdate();
		expect(action.tryActivateOnboarding('slotB')).toBe(false);

		slotComponent.closeOnboarding();
		expect(action.tryActivateOnboarding('slotB')).toBe(true);
		action.deactivateOnboarding('slotB');
		slotFixture.destroy();
	});
});
