import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoaderComponent } from './loader.component';
import { By } from '@angular/platform-browser';

describe('LoaderComponent', () => {
	let component: LoaderComponent;
	let fixture: ComponentFixture<LoaderComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [LoaderComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(LoaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should apply the base class to the host element', () => {
		const hostElement: HTMLElement = fixture.debugElement.nativeElement;
		expect(hostElement.className).toContain('loader');
	});

	it('should pass the iconClass input to the svg element', () => {
		const testClass = { 'custom-class': true };
		fixture.componentRef.setInput('iconClass', testClass);
		fixture.detectChanges();

		const svgElement = fixture.debugElement.query(By.css('svg'));
		expect(svgElement.attributes['class']).toContain('custom-class');
	});
});
