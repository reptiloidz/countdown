import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SvgComponent } from './svg.component';
import { Renderer2, ElementRef } from '@angular/core';

describe('SvgComponent', () => {
	let component: SvgComponent;
	let fixture: ComponentFixture<SvgComponent>;
	let renderer: Renderer2;
	let elementRef: ElementRef<SVGElement>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SvgComponent],
			providers: [
				Renderer2,
				{
					provide: ElementRef,
					useValue: { nativeElement: document.createElementNS('http://www.w3.org/2000/svg', 'svg') },
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SvgComponent);
		component = fixture.componentInstance;
		renderer = fixture.debugElement.injector.get(Renderer2);
		elementRef = fixture.debugElement.injector.get(ElementRef);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should set name and update SVG use element', () => {
		component.name = 'test-icon';
		fixture.detectChanges();

		const useElement = elementRef.nativeElement.querySelector('use');
		expect(useElement).toBeTruthy();
		useElement && expect(useElement.getAttribute('xlink:href')).toBe('assets/sprite.svg#test-icon');
	});

	it('should set the title when provided', () => {
		component.title = 'Test Title';
		fixture.detectChanges();

		const titleElement = elementRef.nativeElement.querySelector('title');
		expect(titleElement).toBeTruthy();
		titleElement && expect(titleElement.textContent).toBe('Test Title');
	});

	it('should apply default width and height', () => {
		expect(component.widthAttr).toBe(16);
		expect(component.heightAttr).toBe(16);
	});

	it('should update width and height when inputs are provided', () => {
		component.width = 32;
		component.height = 32;
		fixture.detectChanges();

		expect(component.widthAttr).toBe(32);
		expect(component.heightAttr).toBe(32);
	});

	it('should set aria-hidden attribute', () => {
		component.ariaHidden = 'false';
		fixture.detectChanges();

		expect(component.ariaHiddenAttr).toBe('false');
	});
});
