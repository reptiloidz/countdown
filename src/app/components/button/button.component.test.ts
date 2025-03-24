import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { ChangeDetectorRef, ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';
import { SvgComponent } from '../svg/svg.component';

describe('ButtonComponent', () => {
	let component: ButtonComponent;
	let fixture: ComponentFixture<ButtonComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ButtonComponent, LoaderComponent, SvgComponent],
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
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(ButtonComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should compute correct componentClass', () => {
		component.view = 'button';
		component.mode = 'primary';
		component.size = 'lg';
		component.disabled = true;
		expect(component.componentClass).toBe('state button button--primary button--lg');

		component.view = 'link';
		component.mode = 'ghost';
		component.size = 'sm';
		expect(component.componentClass).toBe('state link link--ghost link--sm');
	});

	it('should compute correct textClasses', () => {
		component.view = 'button';
		component.textClass = ['custom-class'];
		expect(component.textClasses).toEqual(['button__text', 'custom-class']);

		component.view = 'link';
		expect(component.textClasses).toEqual(['link__text', 'custom-class']);
	});

	it('should render loader when loading is true', () => {
		component.loading = true;
		component.iconPosition = 'left';
		fixture.detectChanges();

		const loaderElement = fixture.nativeElement.querySelector('app-loader');
		expect(loaderElement).toBeTruthy();
		expect((loaderElement as HTMLElement).querySelector('svg')?.classList.contains('button__icon')).toBe(true);
	});

	it('should render icon when loading is false', () => {
		component.loading = false;
		component.icon = 'test-icon';
		component.iconPosition = 'left';
		fixture.detectChanges();

		const iconElement = fixture.nativeElement.querySelector('svg');
		expect(iconElement).toBeTruthy();
		expect(iconElement.getAttribute('ng-reflect-name')).toBe('test-icon');
	});

	it('should set icon title and aria attributes', () => {
		component.icon = 'test-icon';
		component.iconTitle = 'Test Icon';
		component.iconAriaHidden = 'false'; // Устанавливаем 'false'
		fixture.detectChanges();

		const iconElement = fixture.nativeElement.querySelector('svg');

		expect((iconElement as HTMLElement).querySelector('title')?.innerHTML).toBe('Test Icon');
		expect(iconElement.getAttribute('aria-label')).toBe('Test Icon');
		expect((iconElement as HTMLElement).getAttribute('aria-hidden')).toBe('false');
	});

	it('should apply correct class to the icon based on view', () => {
		component.icon = 'test-icon';
		component.view = 'button';
		fixture.detectChanges();

		const iconElement = fixture.nativeElement.querySelector('svg[app-svg]');
		expect(iconElement.classList.contains('button__icon')).toBe(true);

		component.view = 'link';
		const cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
		cdr.detectChanges();
		fixture.detectChanges();
		expect(iconElement.classList.contains('link__icon')).toBe(true);
	});

	it('should apply classes to the host element based on inputs', () => {
		component.view = 'button';
		component.mode = 'positive';
		component.size = 'md';
		fixture.detectChanges();

		const hostElement = fixture.nativeElement;
		expect(hostElement.classList.contains('button')).toBe(true);
		expect(hostElement.classList.contains('button--positive')).toBe(true);
		expect(hostElement.classList.contains('button--md')).toBe(true);
	});

	it('should set type attribute based on input', () => {
		component.type = 'submit';
		fixture.detectChanges();

		const hostElement = fixture.nativeElement;
		expect(hostElement.getAttribute('type')).toBe('submit');
	});
});
