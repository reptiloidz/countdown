import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
	template: `
		<div app-tooltip [text]="'Test tooltip'" [onboarding]="'testOnboarding'">
			<span #tooltipTrigger>Trigger</span>
		</div>

		<ng-template #tooltipContent>Custom Content</ng-template>
	`,
})
class TestHostComponent {
	@ViewChild(TooltipComponent) tooltipComponent!: TooltipComponent;
	@ViewChild('tooltipContent', { static: true }) tooltipContent!: TemplateRef<any>;
}

describe('TooltipComponent', () => {
	let component: TooltipComponent;
	let fixture: ComponentFixture<TestHostComponent>;
	let hostComponent: TestHostComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TooltipComponent, TestHostComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TestHostComponent);
		hostComponent = fixture.componentInstance;
		fixture.detectChanges();
		component = hostComponent.tooltipComponent;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should apply correct classes based on inputs', () => {
		component.vertical = 'top';
		component.horizontal = 'left';
		fixture.detectChanges();
		expect(component.dropClass).toContain('tooltip--top');
		expect(component.dropClass).toContain('tooltip--left');
	});

	it('should disable tooltip when triggerElement is missing', () => {
		component.triggerElement = undefined;
		fixture.detectChanges();
		expect(component.isTooltipOff).toBeTruthy();
	});

	it('should show tooltip content if provided', () => {
		component.tooltipContent = hostComponent.tooltipContent;
		fixture.detectChanges();
		const tooltipBody = fixture.debugElement.query(By.css('.tooltip__body'));
		expect(tooltipBody).toBeTruthy();
	});

	it('should use text input if no template is provided', () => {
		const tooltipText = fixture.debugElement.query(By.css('.tooltip__content'));
		expect(tooltipText.nativeElement.textContent).toContain('Test tooltip');
	});

	it('should mark onboarding as completed when close button is clicked', () => {
		component.onboarding = 'testOnboarding';
		localStorage.setItem('onboarding-testOnboarding', 'false');
		fixture.detectChanges();

		const closeButton = fixture.debugElement.query(By.css('.tooltip__close'));
		closeButton.triggerEventHandler('click', null);
		fixture.detectChanges();

		expect(localStorage.getItem('onboarding-testOnboarding')).toBe('true');
	});
});
