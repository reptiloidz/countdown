import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropComponent } from './drop.component';
import { NotifyService } from 'src/app/services';
import { Renderer2, ChangeDetectorRef, ElementRef, Component, ViewChild, TemplateRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from '../button/button.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
	selector: 'mock-custom-template',
	template: `<ng-template #template><span>Custom Trigger</span></ng-template>`,
})
export class MockCustomTemplateComponent {
	@ViewChild('template', { static: true }) templateRef!: TemplateRef<any>;
}

describe('DropComponent', () => {
	let component: DropComponent;
	let fixture: ComponentFixture<DropComponent>;
	let mockNotifyService: Partial<NotifyService>;
	let mockElementRef: Partial<ElementRef>;

	beforeEach(async () => {
		jest.useFakeTimers(); // Используем фейковые таймеры
		mockNotifyService = {
			notificationsOpened: false,
		};

		mockElementRef = {
			nativeElement: document.createElement('div'),
		};

		// Mock getComputedStyle to return a valid height
		jest.spyOn(window, 'getComputedStyle').mockImplementation((element: Element) => {
			if (element === document.querySelector('footer')) {
				return {
					height: '50px',
					// Добавьте другие свойства, если они нужны
				} as CSSStyleDeclaration;
			}
			return {} as CSSStyleDeclaration;
		});

		await TestBed.configureTestingModule({
			declarations: [DropComponent, ButtonComponent, SvgComponent, MockCustomTemplateComponent],
			providers: [
				{ provide: NotifyService, useValue: mockNotifyService },
				{ provide: ElementRef, useValue: mockElementRef },
				Renderer2,
				ChangeDetectorRef,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DropComponent);
		component = fixture.componentInstance;

		// Хак для замены приватного свойства
		(component as any).elementRef = mockElementRef;

		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should open the dropdown and emit "dropOpened"', () => {
		const dropOpenedSpy = jest.spyOn(component.dropOpened, 'emit');
		component.openHandler();
		jest.runAllTimers();
		expect(component.open).toBe(true);
		expect(dropOpenedSpy).toHaveBeenCalled();
	});

	it('should close the dropdown and emit "dropClosed"', () => {
		component.open = true;
		const dropClosedSpy = jest.spyOn(component.dropClosed, 'emit');
		component.closeHandler();
		jest.runAllTimers();
		expect(component.open).toBe(false);
		expect(dropClosedSpy).toHaveBeenCalled();
	});

	it('should toggle the dropdown state', () => {
		const openHandlerSpy = jest.spyOn(component, 'openHandler');
		const closeHandlerSpy = jest.spyOn(component, 'closeHandler');

		// Тестируем открытие
		component.open = false;
		component.toggleHandler();
		expect(openHandlerSpy).toHaveBeenCalled();

		// Тестируем закрытие
		component.open = true;
		component.toggleHandler();
		expect(closeHandlerSpy).toHaveBeenCalled();
	});

	it('should emit "dropChanged" when changeHandler is called', () => {
		const dropChangedSpy = jest.spyOn(component.dropChanged, 'emit');
		component.changeHandler('new-value');
		expect(component.value).toBe('new-value');
		expect(dropChangedSpy).toHaveBeenCalledWith('new-value');
	});

	it('should render default trigger button if no template is provided', () => {
		component.triggerTemplate = undefined;
		component.buttonLabel = 'Test Button';
		const cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
		cdr.detectChanges();
		fixture.detectChanges();

		const button = fixture.debugElement.query(By.css('button'));
		expect(button.nativeElement.textContent.trim()).toBe('Test Button');
	});

	it('should render custom trigger template if provided', () => {
		// Создаём тестовый шаблон
		const customTemplate = TestBed.createComponent(MockCustomTemplateComponent);
		customTemplate.detectChanges();

		// Устанавливаем кастомный шаблон в качестве `triggerTemplate`
		component.triggerTemplate = customTemplate.componentInstance.templateRef;

		const cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
		cdr.detectChanges();
		fixture.detectChanges();

		// Проверяем, что кастомный шаблон отображается
		const trigger = fixture.debugElement.query(By.css('.drop__nav'));
		expect(trigger.nativeElement.textContent.trim()).toBe('Custom Trigger');
	});

	it('should apply correct classes for vertical positioning', () => {
		component.vertical = 'top';
		component.openHandler();
		jest.runAllTimers();
		fixture.detectChanges();

		expect((component as any).elementRef.nativeElement.classList).toContain('drop--top');
	});

	it('should close dropdown on outside click', () => {
		const closeHandlerSpy = jest.spyOn(component, 'closeHandler');

		component.openHandler();
		component.addDocumentClickListener();

		const clickEvent = new MouseEvent('click', {
			bubbles: true,
		});
		document.dispatchEvent(clickEvent);

		expect(closeHandlerSpy).toHaveBeenCalled();
	});

	it('should not close dropdown if click is inside', () => {
		const closeHandlerSpy = jest.spyOn(component, 'closeHandler');

		component.openHandler();
		component.addDocumentClickListener();

		const insideClickEvent = new MouseEvent('click', {
			bubbles: true,
		});

		// Мокируем клик внутри элемента
		jest.spyOn((component as any).elementRef.nativeElement, 'contains').mockReturnValue(true);

		document.dispatchEvent(insideClickEvent);
		expect(closeHandlerSpy).not.toHaveBeenCalled();
	});

	it('should update value when writeValue is called', () => {
		component.writeValue('test-value');
		expect(component.value).toBe('test-value');
	});

	it('should register onChange callback', () => {
		const mockFn = jest.fn();
		component.registerOnChange(mockFn);

		component.onChange('test-value');
		expect(mockFn).toHaveBeenCalledWith('test-value');
	});

	it('should register onTouched callback', () => {
		const mockFn = jest.fn();
		component.registerOnTouched(mockFn);

		component.onTouched();
		expect(mockFn).toHaveBeenCalled();
	});
});
