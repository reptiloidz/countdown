import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimersComponent } from './timers.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BoardComponent } from '../components/board/board.component';

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
			declarations: [TimersComponent, BoardComponent],
			imports: [NoopAnimationsModule],
			schemas: [NO_ERRORS_SCHEMA],
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
