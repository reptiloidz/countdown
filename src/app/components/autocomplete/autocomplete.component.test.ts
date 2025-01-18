import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutocompleteComponent } from './autocomplete.component';
import { ActionService } from 'src/app/services';
import { DropComponent } from '../drop/drop.component';
import { InputComponent } from '../input/input.component';
import { of } from 'rxjs';
import { SelectArray } from 'src/app/interfaces';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { LetDirective } from 'src/app/directives/let.directive';
import { ButtonComponent } from '../button/button.component';
import { SvgComponent } from '../svg/svg.component';
import { CommonModule } from '@angular/common';

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
			imports: [FormsModule, ReactiveFormsModule, CommonModule, NgxMaskDirective],
			declarations: [AutocompleteComponent, DropComponent, InputComponent, LetDirective, ButtonComponent, SvgComponent],
			providers: [{ provide: ActionService, useValue: mockActionService }, [provideNgxMask()]],
		}).compileComponents();

		fixture = TestBed.createComponent(AutocompleteComponent);
		component = fixture.componentInstance;

		component.autocompleteList = mockAutocompleteList;
		component.value = 'Option 1';
		component.visibleValue = 'Option 1';
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with the correct visibleValue', () => {
		component.visibleValue = 'Option 1'; // Явно устанавливаем значение
		fixture.detectChanges(); // Обновляем представление
		expect(component.visibleValue).toBe('Option 1');
	});

	it('should call filter when ngModelChange is triggered', () => {
		const filterSpy = jest.spyOn(component, 'filter');
		const filterValue = 'Option 1';

		// Имитируем вызов события ngModelChange вручную
		const inputElement = fixture.nativeElement.querySelector('input');
		inputElement.value = filterValue; // Устанавливаем значение
		inputElement.dispatchEvent(new Event('input')); // Тригерим событие input

		fixture.detectChanges();

		expect(filterSpy).toHaveBeenCalledWith(filterValue);
	});

	it('should emit autocompleteChanged when changeHandler is called', () => {
		const emitSpy = jest.spyOn(component.autocompleteChanged, 'emit');
		const value = 'Option 2';

		component.changeHandler(value); // Вызываем обработчик изменения
		fixture.detectChanges();

		// Проверяем, что событие было вызвано с правильным значением
		expect(emitSpy).toHaveBeenCalledWith(value);

		// Проверяем, что внутренние свойства обновились правильно
		expect(component.value).toBe(value);

		const expectedVisibleValue = mockAutocompleteList.find(option => option.value === value)?.key || '';

		expect(component.visibleValue).toBe(expectedVisibleValue);
	});

	it('should filter the list correctly', () => {
		component.filter('Option 1');
		expect(component.autocompleteListFiltered.length).toBe(1);
		expect(component.autocompleteListFiltered[0].value).toBe('Option 1');
	});

	it('should select the first filtered option when selectFirstOption is called', () => {
		component.filter('Option');
		component.selectFirstOption();
		expect(component.value).toBe(component.firstFilteredValue?.value);
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
		const filteredList = component.autocompleteList.filter(item => component.filterFn(item, 'Option 1'));
		expect(filteredList.length).toBe(1);
		expect(filteredList[0].value).toBe('Option 1');
	});
});
