import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimersComponent } from './timers.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';

@Component({ selector: 'app-board', template: '' })
class MockBoardComponent {
	value: any;
	mode: any;
	label: any;
	delayValue: any;
	delayRandomValue: any;
}

describe('TimersComponent', () => {
	let component: TimersComponent;
	let fixture: ComponentFixture<TimersComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TimersComponent, MockBoardComponent],
			imports: [NoopAnimationsModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TimersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should correctly apply input values', () => {
		component.years = 5;
		component.months = 10;
		component.days = 15;
		component.hours = '12';
		component.mins = '30';
		component.secs = '45';
		component.showSec = true;
		fixture.detectChanges();

		expect(component.years).toBe(5);
		expect(component.months).toBe(10);
		expect(component.days).toBe(15);
		expect(component.hours).toBe('12');
		expect(component.mins).toBe('30');
		expect(component.secs).toBe('45');
	});

	it('should not display seconds when showSec is false', () => {
		component.showSec = false;
		fixture.detectChanges();
		const compiled = fixture.nativeElement;
		expect(compiled.querySelector('[label="Секунды"]')).toBeNull();
	});
});
