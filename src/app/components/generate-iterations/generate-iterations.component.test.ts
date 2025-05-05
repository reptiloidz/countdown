import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenerateIterationsComponent } from './generate-iterations.component';
import { ReactiveFormsModule, FormBuilder, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatepickerComponent } from '../datepicker/datepicker.component';
import { Constants } from 'src/app/enums';
import { addMinutes, addMonths, addYears, format } from 'date-fns';
import { CUSTOM_ELEMENTS_SCHEMA, forwardRef, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { SwitcherComponent } from '../switcher/switcher.component';
import { DropComponent } from '../drop/drop.component';
import { InputComponent } from '../input/input.component';
import { RadioComponent } from '../radio/radio.component';
import { ButtonComponent } from '../button/button.component';
import { Iteration } from 'src/app/interfaces';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { millisecondsInHour, millisecondsInMinute } from 'date-fns/constants';

const currentDate = new Date();

describe('GenerateIterationsComponent', () => {
	let component: GenerateIterationsComponent;
	let fixture: ComponentFixture<GenerateIterationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [
				GenerateIterationsComponent,
				DatepickerComponent,
				SwitcherComponent,
				DropComponent,
				InputComponent,
				RadioComponent,
				ButtonComponent,
			],
			imports: [FormsModule, ReactiveFormsModule, NgxMaskDirective],
			schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
			providers: [
				FormBuilder,
				Renderer2,
				{
					provide: NG_VALUE_ACCESSOR,
					useExisting: forwardRef(() => InputComponent),
					multi: true,
				},
				[provideNgxMask()],
			],
		}).compileComponents();

		fixture = TestBed.createComponent(GenerateIterationsComponent);
		component = fixture.componentInstance;
		component.form = new FormBuilder().group({
			iterationsForm: new FormBuilder().group({
				repeatsMode: ['setRepeatsAmount'],
				rangeAmount: [2],
				rangePeriod: [1],
				periodicity: ['perMinutes'],
				monthOptions: ['dayOfMonth'],
			}),
			greenwich: [false],
		});
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize default values on ngOnInit', () => {
		component.ngOnInit();
		const rangeStartDate = component.rangeStartDate;

		expect(component.rangeStartDate).toBeDefined();
		expect(component.rangeEndDate).toEqual(addMinutes(rangeStartDate, 10));
		expect(component.repeats).toEqual([]);
	});

	it('should calculate periodicity value correctly for minutes', () => {
		component.iterationsForm.controls['periodicity'].setValue('perMinutes');
		expect(component.periodicityValue).toEqual(millisecondsInMinute);
	});

	it('should calculate periodicity value correctly for hours', () => {
		component.iterationsForm.controls['periodicity'].setValue('perHours');
		expect(component.periodicityValue).toEqual(millisecondsInHour);
	});

	it('should emit repeats when genRepeats is called', () => {
		const emitSpy = jest.spyOn(component.repeatsAreGenerated, 'emit');
		component.genRepeats();
		expect(emitSpy).toHaveBeenCalled();
		expect(emitSpy.mock.calls[0][0]?.length).toBeGreaterThan(0);
	});

	it('should generate repeats based on rangeAmount when isRepeatsAmountSet is true', () => {
		component.iterationsForm.controls['repeatsMode'].setValue('setRepeatsAmount');
		component.iterationsForm.controls['rangeAmount'].setValue(3);
		const emitSpy = jest.spyOn(component.repeatsAreGenerated, 'emit');
		component.genRepeats();
		expect(emitSpy.mock.calls[0][0]?.length).toEqual(3);
	});

	it('should generate repeats recursively until rangeEndDate when isRepeatsAmountSet is false', () => {
		component.iterationsForm.controls['repeatsMode'].setValue('setRangeEnd');
		component.rangeEndDate = addMinutes(component.rangeStartDate, 30);
		const emitSpy = jest.spyOn(component.repeatsAreGenerated, 'emit');
		component.genRepeats();
		const repeats: Iteration[] = emitSpy.mock.calls[0][0] || [];
		expect(repeats?.length).toBeGreaterThan(0);
		repeats.length &&
			expect(repeats[repeats?.length - 1].date).toEqual(format(component.rangeEndDate, Constants.fullDateFormat));
	});

	it('should update monthOptions on rangeStartDatePicked', () => {
		const newDate = addMonths(currentDate, 1);
		component.rangeStartDatePicked(newDate);
		expect(component.rangeStartDate).toEqual(newDate);
		expect(component.monthOptions.length).toBeGreaterThan(0);
	});

	it('should set periodicity value correctly for perYears', () => {
		component.iterationsForm.controls['periodicity'].setValue('perYears');
		expect(component.getNextMatchYear(1)).toEqual(addYears(component.rangeStartDate, 1));
	});

	it('should update rangeEndDate when rangeEndDatePicked is called', () => {
		const newEndDate = addMinutes(currentDate, 20);
		component.rangeEndDatePicked(newEndDate);
		expect(component.rangeEndDate).toEqual(newEndDate);
	});

	it('should fix disabled date in datepicker when repeatsModeSwitcher is called', () => {
		component.rangeEndRef = {
			fixDisabledDate: jest.fn(),
		} as unknown as DatepickerComponent;
		fixture.detectChanges();
		const fixDisabledDateSpy = jest.spyOn(component.rangeEndRef, 'fixDisabledDate');
		jest.useFakeTimers();
		component.repeatsModeSwitcher();
		jest.runAllTimers();
		expect(fixDisabledDateSpy).toHaveBeenCalled();
		jest.useRealTimers();
	});
});
