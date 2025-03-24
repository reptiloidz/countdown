import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelComponent } from './panel.component';
import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA, TemplateRef, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';

@Component({
	template: `<ng-template #mockTemplate>Mock Content</ng-template>`,
})
class MockHostComponent {
	@ViewChild('mockTemplate', { static: true }) mockTemplate!: TemplateRef<unknown>;
}

const mockAnimations = () => {
	Element.prototype.animate = jest.fn().mockImplementation(() => ({
		finished: Promise.resolve(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		play: jest.fn(),
		cancel: jest.fn(),
	}));
};

describe('PanelComponent', () => {
	let component: PanelComponent;
	let fixture: ComponentFixture<PanelComponent>;

	beforeAll(() => {
		mockAnimations();
	});

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [BrowserAnimationsModule.withConfig({ disableAnimations: true })],
			declarations: [PanelComponent],
			providers: [provideAnimations()],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(PanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should have default values', () => {
		expect(component.open).toBe(false);
		expect(component.icon).toBe('chevron-down');
		expect(component.buttonClass).toBe('');
		expect(component.buttonTitle).toBeNull();
		expect(component.hasFirstUpdateHappened).toBe(false);
		expect(component.panelAnimated).toBe(false);
	});

	it('should toggle panel visibility', () => {
		const spy = jest.spyOn(component.panelVisibilitySwitched, 'emit');

		component.toggleHandler();
		expect(component.open).toBe(true);
		expect(spy).toHaveBeenCalledWith(true);

		component.toggleHandler();
		expect(component.open).toBe(false);
		expect(spy).toHaveBeenCalledWith(false);
	});

	it('should handle open and close', () => {
		component.openHandler();
		expect(component.open).toBe(true);

		component.closeHandler();
		expect(component.open).toBe(false);
	});

	it('should update height', () => {
		// Подготавливаем фейковый таймер
		jest.useFakeTimers();

		const hostFixture = TestBed.createComponent(MockHostComponent);
		hostFixture.detectChanges();
		component.bodyTemplate = hostFixture.componentInstance.mockTemplate;
		const cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
		cdr.detectChanges();
		fixture.detectChanges();

		const el = fixture.debugElement.query(By.css('.panel__content'))?.nativeElement;
		expect(el).toBeTruthy(); // Убеждаемся, что элемент существует

		jest.spyOn(el, 'scrollHeight', 'get').mockReturnValue(100);

		component.updateHeight();

		// Продвигаем таймер вперед, чтобы `requestAnimationFrame` отработал
		jest.advanceTimersByTime(50);
		fixture.detectChanges();

		expect(el.getAttribute('data-height')).toBe('100px');

		// Очистка таймеров после теста
		jest.useRealTimers();
	});

	it('should handle panel animation', () => {
		component.open = false;
		component.panelAnimatedHandler();
		expect(component.panelAnimated).toBe(true); // !false → true

		component.open = true;
		component.panelAnimatedHandler();
		expect(component.panelAnimated).toBe(false); // !true → false
	});
});
