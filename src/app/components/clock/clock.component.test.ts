import { ClockComponent } from './clock.component';
import { Renderer2 } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('ClockComponent', () => {
	let component: ClockComponent;
	let fixture: ComponentFixture<ClockComponent>;
	let rendererMock: jest.Mocked<Renderer2>;

	beforeEach(() => {
		// Настроим TestBed
		TestBed.configureTestingModule({
			declarations: [ClockComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ClockComponent);
		component = fixture.componentInstance;

		// Мокируем Renderer2
		rendererMock = {
			setStyle: jest.fn(),
		} as any;
		component['renderer'] = rendererMock;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should set clock variables on init', () => {
		const currentDate = new Date();
		jest.spyOn(component, 'setClockVariable');

		component.ngOnInit();

		expect(component.setClockVariable).toHaveBeenCalledWith(
			'--clock-current-second',
			currentDate.getSeconds().toString(),
		);
		expect(component.setClockVariable).toHaveBeenCalledWith('--clock-current-hour', currentDate.getHours().toString());
		expect(component.setClockVariable).toHaveBeenCalledWith(
			'--clock-current-minute',
			currentDate.getMinutes().toString(),
		);
	});

	it('should apply innerClass to the element', () => {
		// Устанавливаем innerClass
		component.innerClass = 'test-class';

		// Инициализация компонента и обновление представления
		fixture.detectChanges();

		// Проверка, что класс был добавлен к элементу
		const clockElement = fixture.nativeElement.querySelector('.clock');
		expect(clockElement?.classList.contains('test-class')).toBe(true);
	});

	it('should set style using renderer', () => {
		const name = '--clock-current-second';
		const value = '30';

		component.setClockVariable(name, value);

		// Проверяем, что setStyle был вызван с правильными аргументами
		expect(rendererMock.setStyle).toHaveBeenCalledWith(
			fixture.nativeElement, // Используется nativeElement
			name,
			value,
			expect.any(Number), // Любой флаг (DashCase)
		);
	});
});
