import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PointModesComponent } from './point-modes.component';
import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, ElementRef, NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropComponent } from '../../components/drop/drop.component';
import { InputComponent } from '../../components/input/input.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { NotifyService } from 'src/app/services';

const dropMock = new DropComponent(
	new ElementRef(document.createElement('div')),
	{
		...jest.fn(),
		listen: jest.fn(),
		createElement: jest.fn(),
		setStyle: jest.fn(),
	} as unknown as Renderer2,
	{ detectChanges: jest.fn() } as unknown as ChangeDetectorRef,
	new NotifyService(),
);

describe('PointModesComponent', () => {
	let component: PointModesComponent;
	let fixture: ComponentFixture<PointModesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PointModesComponent, DropComponent, InputComponent],
			imports: [FormsModule, ReactiveFormsModule, NgxMaskDirective],
			providers: [ChangeDetectorRef, [provideNgxMask()]],
			schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(PointModesComponent);
		component = fixture.componentInstance;
		component.form = new FormGroup({
			pointModesForm: new FormGroup({
				firstModeTitle: new FormControl(''),
				secondModeTitle: new FormControl(''),
				firstModeEmoji: new FormControl(''),
				secondModeEmoji: new FormControl(''),
			}),
		});
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should have default values', () => {
		expect(component.emojis).toEqual([]);
		expect(component.emojisCurrent).toEqual([]);
		expect(component.filterEmojiValue).toBe('');
		expect(component.loading).toBe(false);
		expect(component.firstDropOpened).toBe(false);
		expect(component.secondDropOpened).toBe(false);
	});

	it('should handle ngOnInit', () => {
		const spy = jest.spyOn(component['subscriptions'], 'add');
		component.ngOnInit();
		expect(spy).toHaveBeenCalled();
	});

	it('should handle ngOnDestroy', () => {
		const spy = jest.spyOn(component['subscriptions'], 'unsubscribe');
		component.ngOnDestroy();
		expect(spy).toHaveBeenCalled();
	});

	it('should switch modes', () => {
		component.firstModeEmoji.setValue('emoji1');
		component.firstModeTitle.setValue('title1');
		component.secondModeEmoji.setValue('emoji2');
		component.secondModeTitle.setValue('title2');

		component.switchModes();

		expect(component.firstModeEmoji.value).toBe('emoji2');
		expect(component.firstModeTitle.value).toBe('title2');
		expect(component.secondModeEmoji.value).toBe('emoji1');
		expect(component.secondModeTitle.value).toBe('title1');
	});

	it('should apply filter', () => {
		jest.useFakeTimers();
		component.filterRef = new InputComponent();
		component.filterRef.value = 'label1';
		component.emojis = [
			{
				title: 'group1',
				list: [
					{
						emoji: 'emoji1',
						hexcode: 'hexcode1',
						label: 'label1',
						text: 'text1',
						type: 1,
						version: 1,
					},
				],
			},
		];

		component.applyFilter('firstModeEmoji', dropMock);
		jest.advanceTimersByTime(50);

		expect(component.emojisCurrent.length).toBe(1);
		expect(component.emojisCurrent[0].list.length).toBe(1);
		jest.useRealTimers();
	});

	it('should handle clickEmoji', () => {
		const control = new FormControl('');
		const spy = jest.spyOn(dropMock, 'closeHandler');

		component.clickEmoji('emoji', control, dropMock);

		expect(control.value).toBe('emoji');
		expect(spy).toHaveBeenCalled();
	});

	it('should reset modes', () => {
		const spy = jest.spyOn(component.pointModeClosed, 'emit');
		component.resetModes();
		expect(component.firstModeTitle.value).toBeNull();
		expect(component.secondModeTitle.value).toBeNull();
		expect(spy).toHaveBeenCalled();
	});

	it('should submit modes', () => {
		const spy = jest.spyOn(component.pointModeChanged, 'emit');
		component.firstModeEmoji.setValue('emoji1');
		component.firstModeTitle.setValue('title1');
		component.secondModeEmoji.setValue('emoji2');
		component.secondModeTitle.setValue('title2');

		component.submitModes();

		expect(spy).toHaveBeenCalledWith([
			{ icon: 'emoji1', name: 'title1' },
			{ icon: 'emoji2', name: 'title2' },
		]);
	});
});
