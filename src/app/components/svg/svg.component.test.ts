import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SvgComponent } from './svg.component';
import { ElementRef } from '@angular/core';

describe('SvgComponent', () => {
	let component: SvgComponent;
	let fixture: ComponentFixture<SvgComponent>;
	let elementRef: ElementRef<SVGElement>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SvgComponent],
			providers: [
				{
					provide: ElementRef,
					useValue: { nativeElement: document.createElementNS('http://www.w3.org/2000/svg', 'svg') },
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SvgComponent);
		component = fixture.componentInstance;
		elementRef = fixture.debugElement.injector.get(ElementRef);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should set name and update SVG use element', () => {
		fixture.componentRef.setInput('name', 'test-icon');
		fixture.detectChanges();

		const useElement = elementRef.nativeElement.querySelector('use');
		expect(useElement).toBeTruthy();
		useElement && expect(useElement.getAttribute('href')).toBe('assets/sprite.svg#test-icon');
	});

	it('should set the title when provided', () => {
		fixture.componentRef.setInput('title', 'Test Title');
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
		fixture.componentRef.setInput('width', 32);
		fixture.componentRef.setInput('height', 32);
		fixture.detectChanges();

		expect(component.widthAttr).toBe(32);
		expect(component.heightAttr).toBe(32);
	});
});
