import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModeStatsComponent } from './mode-stats.component';
import { ChangeDetectionStrategy } from '@angular/core';
import { Point } from 'src/app/interfaces';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ModeStatsComponent', () => {
	let component: ModeStatsComponent;
	let fixture: ComponentFixture<ModeStatsComponent>;

	const mockPoint: Point = {
		id: 'p1',
		modes: [
			{ name: 'Work', icon: '💼' },
			{ name: 'Rest', icon: '🛌' },
		],
		dates: [
			{
				date: '28.01.2025 12:00',
				reason: 'byHand',
				mode: { name: 'Work', icon: '💼' },
			},
			{
				date: '29.01.2025 12:00',
				reason: 'byHand',
				mode: { name: 'Rest', icon: '🛌' },
			},
		],
		repeatable: true,
		greenwich: false,
		color: 'red',
		direction: 'backward',
		title: 'title',
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ModeStatsComponent],
			schemas: [NO_ERRORS_SCHEMA],
		})
			.overrideComponent(ModeStatsComponent, {
				set: { changeDetection: ChangeDetectionStrategy.Default },
			})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ModeStatsComponent);
		component = fixture.componentInstance;
		component.point = mockPoint;
		fixture.detectChanges();
	});

	it('должен создать компонент', () => {
		expect(component).toBeTruthy();
	});

	it('должен переключать формат и сохранять в localStorage', () => {
		// Имитируем наличие checkbox'ов вручную
		component.formatsRef = {
			element: {
				nativeElement: {
					querySelectorAll: () => [
						{ name: 'minutes', checked: true },
						{ name: 'hours', checked: true },
					],
				},
			},
		} as any;

		component.switchFormat(true);
		expect(component.activeFormat).toBe('minutes_hours');
		expect(localStorage.getItem('statFormat')).toBe('minutes_hours');
	});

	it('должен форматировать минуты в строку', () => {
		const result = component.formatDate(1500); // 1500 минут
		expect(typeof result).toBe('string');
		expect(result.length).toBeGreaterThan(0);
	});

	it('должен устанавливать начальную и конечную дату', () => {
		const start = new Date('2024-01-01T00:00:00.000Z');
		const end = new Date('2024-01-03T00:00:00.000Z');
		component.setStartDate(start);
		expect(component.startDate().toISOString()).toBe(start.toISOString());

		component.setFinalDate(end);
		expect(component.finalDate().toISOString()).toBe(end.toISOString());
	});
});
