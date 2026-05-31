import { ClockComponent } from './clock.component';
import { Renderer2 } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('ClockComponent', () => {
	let component: ClockComponent;
	let fixture: ComponentFixture<ClockComponent>;
	let rendererMock: jest.Mocked<Pick<Renderer2, 'setStyle'>>;

	beforeEach(async () => {
		rendererMock = {
			setStyle: jest.fn(),
		};

		await TestBed.configureTestingModule({
			imports: [ClockComponent],
			providers: [{ provide: Renderer2, useValue: rendererMock }],
		}).compileComponents();

		fixture = TestBed.createComponent(ClockComponent);
		component = fixture.componentInstance;
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
		fixture.componentRef.setInput('innerClass', 'test-class');
		fixture.detectChanges();

		const clockElement = fixture.nativeElement.querySelector('.clock');
		expect(clockElement?.classList.contains('test-class')).toBe(true);
	});

	it('should set style using renderer', () => {
		const spy = jest.spyOn(component, 'setClockVariable');
		component.setClockVariable('--clock-current-second', '30');
		expect(spy).toHaveBeenCalledWith('--clock-current-second', '30');
	});
});
