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

const currentDate = new Date();

describe.skip('GenerateIterationsComponent', () => {
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
			imports: [FormsModule, ReactiveFormsModule],
			schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
			providers: [
				FormBuilder,
				Renderer2,
				{
					provide: NG_VALUE_ACCESSOR,
					useExisting: forwardRef(() => InputComponent),
					multi: true,
				},
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
		expect(component.rangeStartDate).toBeDefined();
		expect(component.rangeEndDate).toEqual(addMinutes(currentDate, 10));
		expect(component.repeats).toEqual([]);
	});

	it('should calculate periodicity value correctly for minutes', () => {
		component.iterationsForm.controls['periodicity'].setValue('perMinutes');
		expect(component.periodicityValue).toEqual(Constants.msInMinute);
	});

	it('should calculate periodicity value correctly for hours', () => {
		component.iterationsForm.controls['periodicity'].setValue('perHours');
		expect(component.periodicityValue).toEqual(Constants.msInMinute * 60);
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
		component.genRepeats();
		expect(component.repeats.length).toEqual(3);
	});

	it('should generate repeats recursively until rangeEndDate when isRepeatsAmountSet is false', () => {
		component.iterationsForm.controls['repeatsMode'].setValue('setRangeEnd');
		component.rangeEndDate = addMinutes(component.rangeStartDate, 30);
		component.genRepeats();
		expect(component.repeats.length).toBeGreaterThan(0);
		expect(format(new Date(component.repeats[component.repeats.length - 1].date), Constants.fullDateFormat)).toEqual(
			format(component.rangeEndDate, Constants.fullDateFormat),
		);
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
		const fixDisabledDateSpy = jest.spyOn(component.rangeEndRef, 'fixDisabledDate');
		component.repeatsModeSwitcher();
		expect(fixDisabledDateSpy).toHaveBeenCalled();
	});
});
