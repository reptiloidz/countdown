import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNgxMask } from 'ngx-mask';
import { AutocompleteComponent } from './autocomplete.component';
import { InputComponent } from '../input/input.component';
import { ActionService } from 'src/app/services';
import { of } from 'rxjs';
import { SelectArray } from 'src/app/interfaces';

describe('AutocompleteComponent', () => {
	let component: AutocompleteComponent;
	let fixture: ComponentFixture<AutocompleteComponent>;
	let mockActionService: Partial<ActionService>;

	const mockAutocompleteList: SelectArray[] = [
		{ key: '1', value: 'Option 1', disabled: false },
		{ key: '2', value: 'Option 2', disabled: false },
		{ key: '3', value: 'Option 3', disabled: true },
	];

	beforeEach(() => {
		mockActionService = {
			eventAutocompleteOpened$: of(),
			autocompleteOpened: jest.fn(),
		};

		TestBed.configureTestingModule({
			imports: [AutocompleteComponent],
			providers: [{ provide: ActionService, useValue: mockActionService }, provideNgxMask()],
		}).compileComponents();

		fixture = TestBed.createComponent(AutocompleteComponent);
		component = fixture.componentInstance;

		fixture.componentRef.setInput('autocompleteList', mockAutocompleteList);
		fixture.componentRef.setInput('value', 'Option 1');
		fixture.componentRef.setInput('visibleValue', '1');
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with the correct visibleValue', () => {
		expect(component.visibleValue()).toBe('1');
	});

	it('should update visibleValue when onVisibleValueChange is triggered', () => {
		component.onVisibleValueChange('Option 1');

		expect(component.visibleValue()).toBe('Option 1');
		expect(component.autocompleteListFiltered().length).toBe(1);
	});

	it('should emit autocompleteChanged when changeHandler is called', () => {
		const emitSpy = jest.spyOn(component.autocompleteChanged, 'emit');
		const value = 'Option 2';

		component.changeHandler(value);
		fixture.detectChanges();

		expect(emitSpy).toHaveBeenCalledWith(value);
		expect(component.visibleValue()).toBe('2');
	});

	it('should filter the list via computed', () => {
		component.onVisibleValueChange('Option 1');
		expect(component.autocompleteListFiltered().length).toBe(1);
		expect(component.autocompleteListFiltered()[0].value).toBe('Option 1');
	});

	it('should select the first filtered option when selectFirstOption is called', () => {
		component.onVisibleValueChange('Option');
		component.selectFirstOption();
		expect(component.visibleValue()).toBe('1');
	});

	it('should handle keydown event and select option on Enter', () => {
		const selectSpy = jest.spyOn(component, 'selectFirstOption');
		const event = new KeyboardEvent('keydown', { key: 'Enter' });

		component.keydown(event);

		expect(selectSpy).toHaveBeenCalled();
	});

	it('should open the dropdown when openHandler is called', () => {
		component.drop = {
			openHandler: jest.fn(),
		} as any;
		const openHandlerSpy = jest.spyOn(component.drop, 'openHandler');
		component.openHandler();

		expect(openHandlerSpy).toHaveBeenCalled();
	});

	it('should correctly filter the list based on the filter function', () => {
		const filteredList = mockAutocompleteList.filter(item => component.filterFn()(item, 'Option 1'));
		expect(filteredList.length).toBe(1);
		expect(filteredList[0].value).toBe('Option 1');
	});

	it('should sync visibleValue when value input changes', () => {
		fixture.componentRef.setInput('value', 'Option 2');
		fixture.componentRef.setInput('visibleValue', '');
		fixture.detectChanges();
		TestBed.flushEffects();

		expect(component.visibleValue()).toBe('2');
	});

	it('should keep user input when autocompleteList reference changes', fakeAsync(() => {
		const years: SelectArray[] = [{ key: 2026, value: '2026', disabled: false }];
		const yearFixture = TestBed.createComponent(AutocompleteComponent);
		yearFixture.componentRef.setInput('autocompleteList', years);
		yearFixture.componentRef.setInput('value', '2026');
		yearFixture.componentRef.setInput('visibleValue', '2026');
		yearFixture.detectChanges();
		TestBed.flushEffects();

		const yearComponent = yearFixture.componentInstance;
		yearComponent.onVisibleValueChange('2025');
		yearFixture.componentRef.setInput('autocompleteList', [...years]);
		yearFixture.detectChanges();
		TestBed.flushEffects();

		expect(yearComponent.visibleValue()).toBe('2025');
	}));

	it('should pass visibleValue to nested input for masked year-like field', fakeAsync(() => {
		const years: SelectArray[] = [{ key: 2026, value: '2026', disabled: false }];
		const yearFixture = TestBed.createComponent(AutocompleteComponent);
		yearFixture.componentRef.setInput('autocompleteList', years);
		yearFixture.componentRef.setInput('value', '2026');
		yearFixture.componentRef.setInput('visibleValue', '2026');
		yearFixture.componentRef.setInput('mask', '0*');
		yearFixture.detectChanges();
		TestBed.flushEffects();
		yearFixture.detectChanges();
		tick();

		const yearComponent = yearFixture.componentInstance;
		const inputComp = yearFixture.debugElement.query(By.css('app-input')).componentInstance as InputComponent;
		const inputEl = yearFixture.nativeElement.querySelector('input.control__input') as HTMLInputElement | null;
		expect(yearComponent.visibleValue()).toBe('2026');
		expect(inputComp.value).toBe('2026');
		expect(inputEl?.value).toBe('2026');
	}));
});
