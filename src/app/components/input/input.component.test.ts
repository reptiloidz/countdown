import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
	let component: InputComponent;
	let fixture: ComponentFixture<InputComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [InputComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(InputComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should bind value to input', () => {
		fixture.componentRef.setInput('value', 'test value');
		fixture.detectChanges();

		const input = fixture.debugElement.query(By.css('input')).nativeElement;

		fixture.whenStable().then(() => {
			expect(input.value).toBe('test value');
		});
	});

	it('should call onInput when input value changes', () => {
		const input = fixture.debugElement.query(By.css('input'));
		const spy = jest.spyOn(component, 'onInput');

		input.nativeElement.value = 'new value';
		input.triggerEventHandler('input', { target: input.nativeElement });

		expect(spy).toHaveBeenCalled();
		expect(component.value()).toBe('new value');
	});

	it('should emit focus event on input focus', () => {
		const spy = jest.spyOn(component.focus, 'emit');
		const input = fixture.debugElement.query(By.css('input'));

		input.triggerEventHandler('focus', new FocusEvent('focus'));

		expect(spy).toHaveBeenCalled();
	});

	it('should emit blur event on input blur', () => {
		const spy = jest.spyOn(component.blur, 'emit');
		const input = fixture.debugElement.query(By.css('input'));

		input.triggerEventHandler('blur', new FocusEvent('blur'));

		expect(spy).toHaveBeenCalled();
	});

	it('should reset value when resetValue is called', () => {
		fixture.componentRef.setInput('clearButtonValue', 'reset value');
		fixture.componentRef.setInput('value', 'old value');
		fixture.detectChanges();
		const spy = jest.spyOn(component.reset, 'emit');

		component.resetValue();

		expect(component.value()).toBe('reset value');
		expect(spy).toHaveBeenCalledWith('reset value');
	});

	it('should toggle password visibility', () => {
		component.type.set('password');

		component.showPassword();
		expect(component.type()).toBe('text');

		component.showPassword();
		expect(component.type()).toBe('password');
	});

	it('should apply correct CSS classes based on invalid input', () => {
		fixture.componentRef.setInput('invalid', true);
		fixture.detectChanges();

		const hostElement = fixture.debugElement;
		expect(hostElement.nativeElement.className).toContain('control--error');

		fixture.componentRef.setInput('invalid', false);
		fixture.detectChanges();

		expect(hostElement.nativeElement.className).not.toContain('control--error');
	});

	it('should render a textarea if textarea input is true', () => {
		fixture.componentRef.setInput('textarea', true);
		fixture.detectChanges();

		const textarea = fixture.debugElement.query(By.css('textarea'));
		expect(textarea).toBeTruthy();
	});

	it('should not render clear button if clearButton input is true and value is empty', () => {
		fixture.componentRef.setInput('clearButton', true);
		fixture.detectChanges();

		const button = fixture.debugElement.query(By.css('button[mode="negative"]'));
		expect(button).toBeFalsy();
	});

	it('should render clear button if clearButton input is true and value is not empty', () => {
		fixture.componentRef.setInput('clearButton', true);
		fixture.componentRef.setInput('value', 'test');
		fixture.detectChanges();

		const button = fixture.debugElement.query(By.css('button[mode="negative"]'));
		expect(button).toBeTruthy();
	});

	it('should render password toggle button if showPasswordButton is true', () => {
		fixture.componentRef.setInput('showPasswordButton', true);
		fixture.detectChanges();

		const button = fixture.debugElement.query(By.css('button[mode="positive"]'));
		expect(button).toBeTruthy();
	});
});
