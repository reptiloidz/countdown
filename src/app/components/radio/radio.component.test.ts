import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioComponent } from './radio.component';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('RadioComponent', () => {
	let component: RadioComponent;
	let fixture: ComponentFixture<RadioComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [RadioComponent, FormsModule, ReactiveFormsModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(RadioComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('items', [
			{ text: 'Option 1', value: '1' },
			{ text: 'Option 2', value: '2' },
		]);
		fixture.componentRef.setInput('control', new FormControl('1'));
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render radio buttons', () => {
		const radioInputs = fixture.debugElement.queryAll(By.css('input[type=radio]'));
		expect(radioInputs.length).toBe(2);
	});

	it('should update value on selection change', () => {
		const radioInputs = fixture.debugElement.queryAll(By.css('input[type=radio]'));
		radioInputs[1].nativeElement.click();
		fixture.detectChanges();
		expect(component.value()).toBe('2');
	});

	it('should emit valueSwitched event on change', () => {
		const emitSpy = jest.spyOn(component.valueSwitched, 'emit');
		const radioInputs = fixture.debugElement.queryAll(By.css('input[type=radio]'));
		radioInputs[1].nativeElement.click();
		fixture.detectChanges();
		expect(emitSpy).toHaveBeenCalledWith('2');
	});

	it('should respect disabled state', () => {
		fixture.componentRef.setInput('items', [
			{ text: 'Option 1', value: '1' },
			{ text: 'Option 2', value: '2', disabled: true },
		]);
		fixture.detectChanges();
		const radioInputs = fixture.debugElement.queryAll(By.css('input[type=radio]'));
		expect(radioInputs[1].nativeElement.disabled).toBeTruthy();
	});
});
