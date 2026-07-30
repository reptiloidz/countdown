import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';
import { ActionService } from 'src/app/services';
import { Subject } from 'rxjs';

describe('CheckboxComponent', () => {
	let component: CheckboxComponent;
	let fixture: ComponentFixture<CheckboxComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CheckboxComponent, FormsModule, ReactiveFormsModule],
			providers: [{ provide: ActionService, useValue: { eventPointsCheckedAll$: new Subject() } }],
		}).compileComponents();

		fixture = TestBed.createComponent(CheckboxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should toggle checked when checkbox is clicked', () => {
		component.checked.set(false);
		fixture.detectChanges();

		const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]')).nativeElement;
		checkbox.click();
		fixture.detectChanges();

		expect(component.checked()).toBe(true);
	});

	it('should apply the correct class based on mode', () => {
		fixture.componentRef.setInput('mode', 'icon');
		fixture.detectChanges();

		const span = fixture.debugElement.nativeElement;
		expect(span.classList).toContain('checkbox--icon');
	});

	it('should disable the checkbox when isDisabled is true', () => {
		fixture.componentRef.setInput('isDisabled', true);
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
		fixture.componentRef.setInput('name', 'test-checkbox');
		fixture.detectChanges();

		const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]')).nativeElement;
		expect(checkbox.getAttribute('name')).toBe('test-checkbox');
	});

	it('should render the icon when mode is icon and icon is provided', () => {
		fixture.componentRef.setInput('mode', 'icon');
		fixture.componentRef.setInput('icon', 'check');
		fixture.detectChanges();

		const svg = fixture.debugElement.query(By.css('svg')).nativeElement;
		expect(svg.getAttribute('ng-reflect-name')).toBe('check');
	});

	it('should update checked when writeValue is called', () => {
		component.writeValue(true);
		expect(component.checked()).toBe(true);

		component.writeValue(false);
		expect(component.checked()).toBe(false);
	});

	it('should update disabled state when setDisabledState is called', () => {
		component.setDisabledState?.(true);
		expect(component.isDisabledState()).toBe(true);

		component.setDisabledState?.(false);
		expect(component.isDisabledState()).toBe(false);
	});

	it('should apply the correct size class to the checkbox box', () => {
		fixture.componentRef.setInput('iconSize', 'sm');
		fixture.detectChanges();

		const checkboxBox = fixture.debugElement.query(By.css('.checkbox__box')).nativeElement;
		expect(checkboxBox.classList).toContain('checkbox__box--sm');
	});
});
