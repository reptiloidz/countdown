import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
	let component: BoardComponent;
	let fixture: ComponentFixture<BoardComponent>;

	beforeAll(() => {
		(window as any).IntersectionObserver = jest.fn(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		}));
	});

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BoardComponent],
			providers: [],
		}).compileComponents();

		fixture = TestBed.createComponent(BoardComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with the correct componentClass', () => {
		expect(component.componentClass).toBe('board');
	});

	it('should initialize with the correct values', () => {
		expect(component.topStaticValue).toBe('00');
		expect(component.topAnimatedValue).toBe('00');
		expect(component.bottomStaticValue).toBe('00');
		expect(component.bottomAnimatedValue).toBe('00');
		expect(component.switchTop).toBe(false);
		expect(component.switchBottom).toBe(false);
		expect(component.timeInterval).toBeInstanceOf(Date);
	});

	it('should initialize with the correct intersectionCallback', () => {
		fixture.detectChanges();
		expect(component.intersectionCallback).toBeInstanceOf(Function);
	});

	it('should initialize with the correct intersectionObserver', () => {
		fixture.detectChanges();
		expect(component.intersectionObserver).toBeDefined();
		expect(window.IntersectionObserver).toHaveBeenCalledTimes(1);
	});

	it('should return the correct componentClass', () => {
		component.mode = 'sm';
		fixture.detectChanges();
		expect(component.componentClass).toBe('board board--sm');
	});

	it('should update static and animated values when initialValue changes', () => {
		const newValue = '99';
		component.initialValue = newValue;
		component.ngOnChanges({
			initialValue: {
				currentValue: newValue,
				previousValue: '00',
				firstChange: false,
				isFirstChange: () => false,
			},
		});
		expect(component.topStaticValue).toBe(newValue);
		expect(component.bottomStaticValue).toBe(newValue);
		expect(component.topAnimatedValue).toBe(newValue);
		expect(component.bottomAnimatedValue).toBe(newValue);
	});

	it('should call switchBoard when value changes', () => {
		jest.spyOn(component, 'switchBoard');
		const newValue = '42';
		component.value = newValue;
		component.ngOnChanges({
			value: {
				currentValue: newValue,
				previousValue: '00',
				firstChange: false,
				isFirstChange: () => false,
			},
		});
		expect(component.switchBoard).toHaveBeenCalled();
	});

	it('should call animateBoard after delay when delay is true', done => {
		jest.spyOn(component, 'animateBoard');
		component.delay = true;
		component.value = '42';
		component.delayValue = 100; // Установим задержку
		component.switchBoard();

		setTimeout(() => {
			expect(component.animateBoard).toHaveBeenCalled();
			done();
		}, 200); // Проверяем с запасом на задержку
	});

	it('should call animateBoard immediately when delay is false', () => {
		jest.spyOn(component, 'animateBoard');
		component.delay = false;
		component.value = '42';
		component.switchBoard();
		expect(component.animateBoard).toHaveBeenCalled();
	});

	it('should update values correctly during animation', done => {
		component.value = '42';
		component.animateBoard();

		// Проверяем начальное состояние
		expect(component.hasInitialSwitched).toBe(true);
		expect(component.topStaticValue).toBe('42');
		expect(component.switchTop).toBe(true);

		// Проверяем состояние после анимации
		setTimeout(() => {
			expect(component.switchTop).toBe(false);
			expect(component.topAnimatedValue).toBe('42');
			expect(component.switchBottom).toBe(true);

			setTimeout(() => {
				expect(component.bottomStaticValue).toBe('42');
				expect(component.switchBottom).toBe(false);
				done();
			}, 200); // Второй таймер для bottom
		}, 200); // Первый таймер для top
	});

	it('should disconnect intersectionObserver on destroy', () => {
		const mockDisconnect = jest.fn();
		const mockIntersectionObserver = {
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: mockDisconnect,
		};

		// Мокаем IntersectionObserver
		(window as any).IntersectionObserver = jest.fn(() => mockIntersectionObserver);

		// Создаем компонент
		fixture.detectChanges();

		// Убедимся, что intersectionObserver инициализирован
		expect(component.intersectionObserver).toBeDefined();

		// Тестируем вызов disconnect
		component.ngOnDestroy();
		expect(mockDisconnect).toHaveBeenCalled();
	});

	it('should add and remove class based on intersection state', () => {
		component.ngOnInit(); // Явно вызываем ngOnInit для инициализации

		const targetElement = document.createElement('div');

		// Создаем mock IntersectionObserverEntry
		const mockEntryIntersecting = {
			target: targetElement,
			isIntersecting: true,
			boundingClientRect: {} as DOMRectReadOnly,
			intersectionRatio: 1,
			intersectionRect: {} as DOMRectReadOnly,
			rootBounds: null,
			time: Date.now(),
		};

		const mockEntryNotIntersecting = {
			...mockEntryIntersecting,
			isIntersecting: false,
		};

		// Вызываем intersectionCallback
		component.intersectionCallback([mockEntryIntersecting], {} as IntersectionObserver);
		expect(targetElement.classList.contains('board--visible')).toBe(true);

		component.intersectionCallback([mockEntryNotIntersecting], {} as IntersectionObserver);
		expect(targetElement.classList.contains('board--visible')).toBe(false);
	});

	it('should render switchTop and switchBottom elements conditionally', () => {
		component.switchTop = true;
		component.switchBottom = true;
		fixture.detectChanges();

		const switchTopElement = fixture.nativeElement.querySelector('.board__half--animate');
		const switchBottomElement = fixture.nativeElement.querySelector('.board__half--animate.board__half--bottom');

		expect(switchTopElement).toBeTruthy();
		expect(switchBottomElement).toBeTruthy();
	});

	it('should apply correct classes to the component', () => {
		component.mode = 'logo';
		fixture.detectChanges();

		const hostElement = fixture.nativeElement; // Хост-элемент компонента
		expect(hostElement.classList.contains('board--logo')).toBe(true);
	});

	it('should update label correctly', () => {
		component.label = 'Test Label';
		fixture.detectChanges();

		const labelElement = fixture.nativeElement.querySelector('.board__label');
		expect(labelElement.textContent).toBe('Test Label');
	});
});
