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

	it('should show full list on open before user types', () => {
		component.drop = { openHandler: jest.fn(), closeHandler: jest.fn() } as any;
		fixture.componentRef.setInput('value', 'Option 1');
		component.visibleValue.set('1');
		fixture.detectChanges();

		component.openHandler();

		expect(component.autocompleteListFiltered().length).toBe(mockAutocompleteList.length);
	});

	it('should filter list only after user types, not from displayed value alone', () => {
		fixture.componentRef.setInput('value', 'Option 1');
		component.visibleValue.set('1');
		fixture.detectChanges();

		expect(component.autocompleteListFiltered().length).toBe(mockAutocompleteList.length);

		component.onVisibleValueChange('1');
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

	it('should apply typed value on Enter when it matches list item', () => {
		const emitSpy = jest.spyOn(component.autocompleteChanged, 'emit');
		component.onVisibleValueChange('Option 2');
		const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });

		component.keydown(event);

		expect(event.defaultPrevented).toBe(true);
		expect(emitSpy).toHaveBeenCalledWith('Option 2');
	});

	it('should resolve month number 1 as January (0) not February (1) on Enter', () => {
		const filterMonth = (item: SelectArray, filterValue: string) =>
			(item.key.toString().includes(filterValue) && !item.disabled) ||
			((+item.value + 1).toString().includes(filterValue) && !item.disabled);
		const months: SelectArray[] = [
			{ key: 'январь', value: 0, disabled: false },
			{ key: 'февраль', value: 1, disabled: false },
			{ key: 'ноябрь', value: 10, disabled: false },
			{ key: 'декабрь', value: 11, disabled: false },
		];
		const monthFixture = TestBed.createComponent(AutocompleteComponent);
		monthFixture.componentRef.setInput('autocompleteList', months);
		monthFixture.componentRef.setInput('filterFn', filterMonth);
		monthFixture.componentRef.setInput('value', 0);
		monthFixture.detectChanges();

		const monthComponent = monthFixture.componentInstance;
		const emitSpy = jest.spyOn(monthComponent.autocompleteChanged, 'emit');
		monthComponent.onVisibleValueChange('1');
		monthComponent.keydown(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));

		expect(emitSpy).toHaveBeenCalledWith(0);
	});

	it('should resolve month number 11 as November (10) not December (11) on Enter', () => {
		const filterMonth = (item: SelectArray, filterValue: string) =>
			(item.key.toString().includes(filterValue) && !item.disabled) ||
			((+item.value + 1).toString().includes(filterValue) && !item.disabled);
		const months: SelectArray[] = [
			{ key: 'ноябрь', value: 10, disabled: false },
			{ key: 'декабрь', value: 11, disabled: false },
		];
		const monthFixture = TestBed.createComponent(AutocompleteComponent);
		monthFixture.componentRef.setInput('autocompleteList', months);
		monthFixture.componentRef.setInput('filterFn', filterMonth);
		monthFixture.componentRef.setInput('value', 10);
		monthFixture.detectChanges();

		const monthComponent = monthFixture.componentInstance;
		const emitSpy = jest.spyOn(monthComponent.autocompleteChanged, 'emit');
		monthComponent.onVisibleValueChange('11');
		monthComponent.keydown(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));

		expect(emitSpy).toHaveBeenCalledWith(10);
	});

	it('should apply typed year on Enter even if it is not the first filtered item', () => {
		const years: SelectArray[] = [
			{ key: 2024, value: '2024', disabled: false },
			{ key: 2025, value: '2025', disabled: false },
		];
		const yearFixture = TestBed.createComponent(AutocompleteComponent);
		yearFixture.componentRef.setInput('autocompleteList', years);
		yearFixture.componentRef.setInput('value', '2024');
		yearFixture.detectChanges();

		const yearComponent = yearFixture.componentInstance;
		const emitSpy = jest.spyOn(yearComponent.autocompleteChanged, 'emit');
		yearComponent.onVisibleValueChange('2025');
		yearComponent.keydown(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));

		expect(emitSpy).toHaveBeenCalledWith('2025');
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
			closeHandler: jest.fn(),
		} as any;
		const openHandlerSpy = jest.spyOn(component.drop, 'openHandler');
		component.onVisibleValueChange('Option');
		component.openHandler();

		expect(openHandlerSpy).toHaveBeenCalled();
		expect(component.autocompleteListFiltered().length).toBe(mockAutocompleteList.length);
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
