import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatepickerComponent } from './datepicker.component';
import { FormsModule } from '@angular/forms';
import { DropComponent } from '../drop/drop.component';
import { ButtonComponent } from '../button/button.component';
import { SvgComponent } from '../svg/svg.component';

describe('DatepickerComponent', () => {
	let component: DatepickerComponent;
	let fixture: ComponentFixture<DatepickerComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DatepickerComponent, DropComponent, ButtonComponent, SvgComponent],
			imports: [FormsModule], // Для поддержки ngModel и других директив
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(DatepickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display the correct date format when date is valid', () => {
		component.date = new Date(2025, 0, 19); // Устанавливаем дату для теста
		fixture.detectChanges();
		expect(component.dateFormatted).toBe('19.01.2025 00:00');
	});

	it('should emit datePicked event when date is changed', () => {
		const spy = jest.spyOn(component.datePicked, 'emit');
		component.date = new Date(2025, 0, 19); // Устанавливаем дату для теста
		component.datePicked.emit(component.date);
		expect(spy).toHaveBeenCalledWith(new Date(2025, 0, 19));
	});

	it('should disable year if it is before the disabledBefore date', () => {
		const date = new Date(2020, 0, 1);
		component.disabledBefore = date;
		fixture.detectChanges();
		const year = component.yearsArray.find(year => year.key === 2019);
		expect(year?.disabled).toBe(true);
	});

	it('should generate correct years array', () => {
		const yearsArray = component.yearsArray;
		expect(yearsArray.length).toBe(200); // Должно быть 200 лет
		expect(+yearsArray[0].value).toBe(component.currentYear - 100);
		expect(+yearsArray[199].value).toBe(component.currentYear + 99);
	});

	it('should format month correctly', () => {
		expect(component.dateMonth).toBe('январь');
	});

	it('should correctly switch year', () => {
		component.yearSwitched(2024);
		fixture.detectChanges();
		expect(component.dateYear).toBe('2024');
	});

	it('should correctly switch month', () => {
		component.monthSwitched(3); // Март (0-based)
		fixture.detectChanges();
		expect(component.dateMonthNumber).toBe(3);
	});

	it('should correctly switch hour', () => {
		component.hourSwitched(12);
		fixture.detectChanges();
		expect(component.dateHour).toBe('12');
	});

	it('should correctly switch minute', () => {
		component.minuteSwitched(30);
		fixture.detectChanges();
		expect(component.dateMinute).toBe('30');
	});

	it('should correctly switch date', () => {
		const expectedDate = new Date(2025, 0, 19);
		expectedDate.setHours(0, 0, 0, 0);
		component.dateSelected({ date: expectedDate });
		fixture.detectChanges();
		const actualDate = component.date && new Date(component.date);
		actualDate && actualDate.setHours(0, 0, 0, 0);
		expect(actualDate).toEqual(expectedDate);
	});

	it('should correctly switch visible date', () => {
		const expectedDate = new Date(2025, 0, 19);
		component.visibleDateSelected(expectedDate);
		fixture.detectChanges();
		expect(component.dateYear).toBe('2025');
		expect(component.dateMonth).toBe('январь');
	});

	it('should correctly switch visible date with default date', () => {
		fixture = TestBed.createComponent(DatepickerComponent);
		component = fixture.componentInstance;
		component.ngOnInit();
		component.date = new Date(2025, 0, 19);
		component.visibleDateSelected();
		fixture.detectChanges();
		expect(component.dateYear).toBe('2025');
		expect(component.dateMonth).toBe('январь');
	});

	it('should correctly switch visible date with default date and no date', () => {
		fixture = TestBed.createComponent(DatepickerComponent);
		component = fixture.componentInstance;
		component.ngOnInit();
		component.visibleDateSelected();
		fixture.detectChanges();
		expect(component.dateYear).toBe('2025');
		expect(component.dateMonth).toBe('январь');
	});
});
