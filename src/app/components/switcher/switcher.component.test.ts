import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwitcherComponent } from './switcher.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('SwitcherComponent', () => {
	let component: SwitcherComponent;
	let fixture: ComponentFixture<SwitcherComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SwitcherComponent, FormsModule, ReactiveFormsModule],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SwitcherComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('items', [
			{ value: 'one', text: 'One' },
			{ value: 'two', text: 'Two' },
		]);
		component.writeValue('one');
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render switcher items', () => {
		const items = fixture.debugElement.queryAll(By.css('.switcher__item'));
		expect(items.length).toBe(2);
	});

	it('should update value on option select', () => {
		const input = fixture.debugElement.query(By.css('input[value="two"]'));
		input.nativeElement.click();
		fixture.detectChanges();
		expect(component.value()).toBe('two');
	});

	it('should emit valueSwitched event on selection', () => {
		const emitSpy = jest.spyOn(component.valueSwitched, 'emit');
		const input = fixture.debugElement.query(By.css('input[value="two"]'));
		input.nativeElement.click();
		fixture.detectChanges();
		expect(emitSpy).toHaveBeenCalledWith('two');
	});

	it('should display correct class based on mode and size', () => {
		fixture.componentRef.setInput('mode', 'ghost');
		fixture.componentRef.setInput('size', 'sm');
		fixture.detectChanges();
		expect(fixture.debugElement.classes['switcher--ghost']).toBeTruthy();
		expect(fixture.debugElement.classes['switcher--sm']).toBeTruthy();
	});
});
