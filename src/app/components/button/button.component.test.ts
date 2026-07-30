import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { ChangeDetectorRef, ElementRef } from '@angular/core';

describe('ButtonComponent', () => {
	let component: ButtonComponent;
	let fixture: ComponentFixture<ButtonComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ButtonComponent],
			providers: [
				{
					provide: ElementRef,
					useValue: {
						nativeElement: {
							nodeName: 'button',
						},
					},
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ButtonComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should compute correct componentClass', () => {
		fixture.componentRef.setInput('view', 'button');
		fixture.componentRef.setInput('mode', 'primary');
		fixture.componentRef.setInput('size', 'lg');
		fixture.componentRef.setInput('disabled', true);
		expect(component.componentClass).toBe('state button button--primary button--lg');

		fixture.componentRef.setInput('view', 'link');
		fixture.componentRef.setInput('mode', 'ghost');
		fixture.componentRef.setInput('size', 'sm');
		expect(component.componentClass).toBe('state link link--ghost link--sm');
	});

	it('should compute correct textClasses', () => {
		fixture.componentRef.setInput('view', 'button');
		fixture.componentRef.setInput('textClass', ['custom-class']);
		expect(component.textClasses).toEqual(['button__text', 'custom-class']);

		fixture.componentRef.setInput('view', 'link');
		expect(component.textClasses).toEqual(['link__text', 'custom-class']);
	});

	it('should render loader when loading is true', () => {
		fixture.componentRef.setInput('loading', true);
		fixture.componentRef.setInput('iconPosition', 'left');
		fixture.detectChanges();

		const loaderElement = fixture.nativeElement.querySelector('app-loader');
		expect(loaderElement).toBeTruthy();
		expect((loaderElement as HTMLElement).querySelector('svg')?.classList.contains('button__icon')).toBe(true);
	});

	it('should render icon when loading is false', () => {
		fixture.componentRef.setInput('loading', false);
		fixture.componentRef.setInput('icon', 'test-icon');
		fixture.componentRef.setInput('iconPosition', 'left');
		fixture.detectChanges();

		const iconElement = fixture.nativeElement.querySelector('svg');
		expect(iconElement).toBeTruthy();
		expect(iconElement.getAttribute('ng-reflect-name')).toBe('test-icon');
	});

	it('should set icon title and aria attributes', () => {
		fixture.componentRef.setInput('icon', 'test-icon');
		fixture.componentRef.setInput('iconTitle', 'Test Icon');
		fixture.componentRef.setInput('iconAriaHidden', 'false');
		fixture.detectChanges();

		const iconElement = fixture.nativeElement.querySelector('svg');

		expect((iconElement as HTMLElement).querySelector('title')?.innerHTML).toBe('Test Icon');
		expect(iconElement.getAttribute('aria-label')).toBe('Test Icon');
		expect((iconElement as HTMLElement).getAttribute('aria-hidden')).toBe('false');
	});

	it('should apply correct class to the icon based on view', () => {
		fixture.componentRef.setInput('icon', 'test-icon');
		fixture.componentRef.setInput('view', 'button');
		fixture.detectChanges();

		const iconElement = fixture.nativeElement.querySelector('svg[app-svg]');
		expect(iconElement.classList.contains('button__icon')).toBe(true);

		fixture.componentRef.setInput('view', 'link');
		const cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
		cdr.detectChanges();
		fixture.detectChanges();
		expect(iconElement.classList.contains('link__icon')).toBe(true);
	});

	it('should apply classes to the host element based on inputs', () => {
		fixture.componentRef.setInput('view', 'button');
		fixture.componentRef.setInput('mode', 'positive');
		fixture.componentRef.setInput('size', 'md');
		fixture.detectChanges();

		const hostElement = fixture.nativeElement;
		expect(hostElement.classList.contains('button')).toBe(true);
		expect(hostElement.classList.contains('button--positive')).toBe(true);
		expect(hostElement.classList.contains('button--md')).toBe(true);
	});

	it('should set type attribute based on input', () => {
		fixture.componentRef.setInput('type', 'submit');
		fixture.detectChanges();

		const hostElement = fixture.nativeElement;
		expect(hostElement.getAttribute('type')).toBe('submit');
	});
});
