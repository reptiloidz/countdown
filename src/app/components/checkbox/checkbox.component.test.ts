import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SvgComponent } from '../svg/svg.component';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';

describe('CheckboxComponent', () => {
	let component: CheckboxComponent;
	let fixture: ComponentFixture<CheckboxComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CheckboxComponent, SvgComponent],
			imports: [FormsModule, ReactiveFormsModule],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(CheckboxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should toggle isChecked when checkbox is clicked', () => {
		component.isChecked = false;
		fixture.detectChanges();

		const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]')).nativeElement;
		checkbox.click();
		fixture.detectChanges();

		expect(component.isChecked).toBe(true);
	});

	it('should apply the correct class based on mode', () => {
		component.mode = 'icon';
		fixture.detectChanges();

		const span = fixture.debugElement.nativeElement;
		expect(span.classList).toContain('checkbox--icon');
	});

	it('should disable the checkbox when isDisabled is true', () => {
		component.isDisabled = true;
		const cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
		cdr.detectChanges();
		fixture.detectChanges();

		const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]')).nativeElement;
		expect(checkbox.disabled).toBe(true);
	});

	it('should call onChange when checkbox value changes', () => {
		const onChangeSpy = jest.fn();
		component.registerOnChange(onChangeSpy);

		component.onCheckboxChange({ target: { checked: true } } as any);
		expect(onChangeSpy).toHaveBeenCalledWith(true);
	});

	it('should call onTouched when checkbox is interacted with', () => {
		const onTouchedSpy = jest.fn();
		component.registerOnTouched(onTouchedSpy);

		component.onCheckboxChange({ target: { checked: true } } as any);
		expect(onTouchedSpy).toHaveBeenCalled();
	});

	it('should bind the name attribute to the input element', () => {
		component.name = 'test-checkbox';
		const cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
		cdr.detectChanges();
		fixture.detectChanges();

		const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]')).nativeElement;
		expect(checkbox.getAttribute('name')).toBe('test-checkbox');
	});

	it('should render the icon when mode is icon and icon is provided', () => {
		component.mode = 'icon';
		component.icon = 'check';
		fixture.detectChanges();

		const svg = fixture.debugElement.query(By.css('svg')).nativeElement;
		expect(svg.getAttribute('ng-reflect-name')).toBe('check');
	});

	it('should update isChecked when writeValue is called', () => {
		component.writeValue(true);
		expect(component.isChecked).toBe(true);

		component.writeValue(false);
		expect(component.isChecked).toBe(false);
	});

	it('should update isDisabled when setDisabledState is called', () => {
		if (component.setDisabledState) {
			component.setDisabledState(true);
			expect(component.isDisabled).toBe(true);

			component.setDisabledState(false);
			expect(component.isDisabled).toBe(false);
		}
	});

	it('should apply the correct size class to the checkbox box', () => {
		component.iconSize = 'sm';
		const cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
		cdr.detectChanges();
		fixture.detectChanges();

		const checkboxBox = fixture.debugElement.query(By.css('.checkbox__box')).nativeElement;
		expect(checkboxBox.classList).toContain('checkbox__box--sm');
	});
});
