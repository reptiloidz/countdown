import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InputComponent } from './input.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

describe('InputComponent', () => {
	let component: InputComponent;
	let fixture: ComponentFixture<InputComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [InputComponent],
			schemas: [NO_ERRORS_SCHEMA],
			imports: [FormsModule, NgxMaskDirective],
			providers: [[provideNgxMask()]],
		}).compileComponents();

		fixture = TestBed.createComponent(InputComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should bind value to input', () => {
		// Устанавливаем значение
		component.value = 'test value';

		// Обновляем отображение
		fixture.detectChanges();

		// Находим input и обновляем его привязку через ngModel
		const input = fixture.debugElement.query(By.css('input')).nativeElement;

		// Триггерим изменения, чтобы убедиться в синхронизации
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
		expect(component.value).toBe('new value');
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
		component.clearButtonValue = 'reset value';
		const spy = jest.spyOn(component.reset, 'emit');

		component.resetValue();

		expect(component.value).toBe('reset value');
		expect(spy).toHaveBeenCalledWith('reset value');
	});

	it('should toggle password visibility', () => {
		component.type = 'password';

		component.showPassword();
		expect(component.type).toBe('text');

		component.showPassword();
		expect(component.type).toBe('password');
	});

	it('should apply correct CSS classes based on invalid input', () => {
		component.invalid = true;
		fixture.detectChanges();

		const hostElement = fixture.debugElement;
		expect(hostElement.nativeElement.className).toContain('control--error');

		component.invalid = false;
		fixture.detectChanges();

		expect(hostElement.nativeElement.className).not.toContain('control--error');
	});

	it('should render a textarea if textarea input is true', () => {
		component.textarea = true;
		fixture.detectChanges();

		const textarea = fixture.debugElement.query(By.css('textarea'));
		expect(textarea).toBeTruthy();
	});

	it('should render clear button if clearButton input is true', () => {
		component.clearButton = true;
		fixture.detectChanges();

		const button = fixture.debugElement.query(By.css('button[mode="negative"]'));
		expect(button).toBeTruthy();
	});

	it('should render password toggle button if showPasswordButton is true', () => {
		component.showPasswordButton = true;
		fixture.detectChanges();

		const button = fixture.debugElement.query(By.css('button[mode="positive"]'));
		expect(button).toBeTruthy();
	});
});
