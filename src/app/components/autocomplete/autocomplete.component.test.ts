import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxMask } from 'ngx-mask';
import { AutocompleteComponent } from './autocomplete.component';
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
});
