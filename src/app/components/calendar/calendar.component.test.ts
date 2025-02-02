import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Iteration, Point } from 'src/app/interfaces';
import { SwitcherComponent } from '../switcher/switcher.component';
import { By } from '@angular/platform-browser';

// Mock Data
const mockDataPoints: Point[] = [
	{
		title: 'Task 1',
		description: 'First Task',
		dates: [{ date: '15.01.2025 12:25', reason: 'byHand', comment: 'Manual entry' }],
		id: '1',
		direction: 'forward',
		greenwich: true,
		repeatable: false,
		color: 'red',
	},
	{
		title: 'Task 2',
		description: 'Second Task',
		dates: [{ date: '20.01.2025 16:40', reason: 'frequency', comment: 'Recurring task' }],
		id: '2',
		direction: 'backward',
		greenwich: false,
		repeatable: true,
		color: 'blue',
	},
];

const mockIterations: Iteration[] = [
	{ date: '10.01.2025 12:00', reason: 'byHand', comment: 'Start of project' },
	{ date: '25.01.2025 23:59', reason: 'frequency', comment: 'Milestone reached' },
];

// Mock Auth Service
const mockAuth = {
	currentUser: {
		uid: 'test-user',
		displayName: 'Test User',
		email: 'test@example.com',
	},
	signInWithEmailAndPassword: jest.fn(),
	signOut: jest.fn(),
};

describe('CalendarComponent', () => {
	let component: CalendarComponent;
	let fixture: ComponentFixture<CalendarComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CalendarComponent, SwitcherComponent],
			imports: [FormsModule],
			providers: [{ provide: Auth, useValue: mockAuth }],
		}).compileComponents();

		fixture = TestBed.createComponent(CalendarComponent);
		component = fixture.componentInstance;

		// Set initial inputs
		component.points = mockDataPoints;
		component.iterations = mockIterations;

		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with the current date', () => {
		const today = new Date();
		expect(component.selectedDate.getDate()).toEqual(today.getDate());
		expect(component.selectedDate.getMonth()).toEqual(today.getMonth());
		expect(component.selectedDate.getFullYear()).toEqual(today.getFullYear());
	});

	it('should generate the correct days for the current month', () => {
		let result = 0;
		component.calendarArray.forEach(week => {
			week.forEach(day => {
				if (day) {
					result++;
				}
			});
		});
		expect(result).toBeGreaterThan(27); // Minimum days in a month
		expect(result).toBeLessThanOrEqual(42); // Maximum days in a grid
	});

	it('should navigate to the previous month', () => {
		component.visibleDate = new Date(2025, 2, 1);
		const currentMonth = component.visibleDate.getMonth();
		component.switchCalendarPeriod(false);
		expect(component.visibleDate.getMonth()).toBe(currentMonth === 0 ? 11 : currentMonth - 1);
	});

	it('should navigate to the next month', () => {
		const currentMonth = component.visibleDate.getMonth();
		component.switchCalendarPeriod(true);
		expect(component.visibleDate.getMonth()).toBe((currentMonth + 1) % 12);
	});

	it('should select a date when clicked', () => {
		const date = new Date(2025, 0, 15); // 15th January 2025
		component.dateClicked({
			date: date,
			activeMode: 'month',
			iterations: [],
			points: [],
		});
		expect(component.selectedDate).toEqual(date);
	});

	it('should highlight dates with data points', () => {
		let result = 0;
		component.visibleDate = new Date(2025, 0, 15);
		component.calendarArray.forEach(week => {
			week.forEach(day => {
				if (day && day.points.length > 0) {
					result++;
				}
			});
		});
		expect(result).toEqual(mockDataPoints.length);
	});

	it('should render days in the template', () => {
		const dayElements = fixture.debugElement.queryAll(By.css('.calendar__cell'));
		let result = 0;
		component.calendarArray.forEach(week => {
			week.forEach(day => {
				if (day) {
					result++;
				}
			});
		});
		expect(dayElements.length).toBe(result);
	});

	it('should emit an event when a date is selected', () => {
		jest.spyOn(component.dateSelected, 'emit');
		const date = new Date(2025, 0, 15);
		component.dateClicked({
			date: date,
			activeMode: 'month',
			iterations: [],
			points: [],
		});
		expect(component.dateSelected.emit).toHaveBeenCalledWith({
			date: date,
			mode: 'month',
			data: [],
		});
	});

	it('should emit an event when calendar mode switched', () => {
		jest.spyOn(component.modeSelected, 'emit');
		component.switchCalendarMode('day');
		expect(component.modeSelected.emit).toHaveBeenCalledWith('day');
	});

	it('should visibleDate changed to now', () => {
		component.visibleDate = new Date(2025, 2, 1);
		component.switchCalendarToNow();
		const today = new Date();
		expect(component.visibleDate.getDate()).toEqual(today.getDate());
		expect(component.visibleDate.getMonth()).toEqual(today.getMonth());
		expect(component.visibleDate.getFullYear()).toEqual(today.getFullYear());
	});

	it('should visibleDate changed to selectedDate', () => {
		component.visibleDate = new Date(2025, 2, 1);
		component.switchCalendarToSelected();
		expect(component.visibleDate.getDate()).toEqual(component.selectedDate.getDate());
		expect(component.visibleDate.getMonth()).toEqual(component.selectedDate.getMonth());
		expect(component.visibleDate.getFullYear()).toEqual(component.selectedDate.getFullYear());
	});
});
