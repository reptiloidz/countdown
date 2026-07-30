import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimersComponent } from './timers.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
describe('TimersComponent', () => {
	let component: TimersComponent;
	let fixture: ComponentFixture<TimersComponent>;

	beforeAll(() => {
		(window as any).IntersectionObserver = jest.fn(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		}));
	});

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [NoopAnimationsModule, TimersComponent],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TimersComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('hours', '00');
		fixture.componentRef.setInput('mins', '00');
		fixture.componentRef.setInput('secs', '00');
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should correctly apply input values', () => {
		fixture.componentRef.setInput('years', 5);
		fixture.componentRef.setInput('months', 10);
		fixture.componentRef.setInput('days', 15);
		fixture.componentRef.setInput('hours', '12');
		fixture.componentRef.setInput('mins', '30');
		fixture.componentRef.setInput('secs', '45');
		fixture.componentRef.setInput('showSec', true);
		fixture.detectChanges();

		expect(component.years()).toBe(5);
		expect(component.months()).toBe(10);
		expect(component.days()).toBe(15);
		expect(component.hours()).toBe('12');
		expect(component.mins()).toBe('30');
		expect(component.secs()).toBe('45');
	});

	it('should not display seconds when showSec is false', () => {
		fixture.componentRef.setInput('showSec', false);
		fixture.detectChanges();
		const compiled = fixture.nativeElement;
		expect(compiled.querySelector('[label="Секунды"]')).toBeNull();
	});
});
