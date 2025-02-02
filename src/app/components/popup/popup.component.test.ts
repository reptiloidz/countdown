import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupComponent } from './popup.component';
import { PopupService } from 'src/app/services';
import { ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
	template: `<ng-template #popupContent></ng-template>`,
})
class MockHostComponent {
	@ViewChild('popupContent', { read: ViewContainerRef, static: true }) popupContent!: ViewContainerRef;
}

describe('PopupComponent', () => {
	let component: PopupComponent;
	let fixture: ComponentFixture<PopupComponent>;
	let popupService: PopupService;
	let cdr: ChangeDetectorRef;

	beforeEach(async () => {
		const popupServiceMock = {
			eventPopupOpen$: new Subject(),
			eventPopupClose$: new Subject(),
			hide: jest.fn(),
		};

		await TestBed.configureTestingModule({
			declarations: [PopupComponent, MockHostComponent],
			providers: [{ provide: PopupService, useValue: popupServiceMock }, ChangeDetectorRef],
		}).compileComponents();

		fixture = TestBed.createComponent(PopupComponent);
		component = fixture.componentInstance;
		popupService = TestBed.inject(PopupService);
		cdr = TestBed.inject(ChangeDetectorRef);
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with default values', () => {
		expect(component.title).toBe('');
		expect(component.isVisible).toBe(false);
	});

	it('should subscribe to popupService events on init', () => {
		const openSpy = jest.spyOn(popupService.eventPopupOpen$, 'subscribe');
		const closeSpy = jest.spyOn(popupService.eventPopupClose$, 'subscribe');

		component.ngOnInit();

		expect(openSpy).toHaveBeenCalled();
		expect(closeSpy).toHaveBeenCalled();
	});

	it('should show popup with provided title and component', () => {
		const mockComponent = MockHostComponent;
		const mockInputs = { key: 'value' };

		component.show('Test Title', mockComponent, mockInputs);

		expect(component.isVisible).toBe(true);
		expect(component.title).toBe('Test Title');
	});

	it('should close popup and clear content', () => {
		component.isVisible = true;
		component.close();

		expect(component.isVisible).toBe(false);
		expect(popupService.hide).toHaveBeenCalled();
	});

	it('should close popup on escape keydown', () => {
		component.isVisible = true;
		const closeSpy = jest.spyOn(component, 'close');

		component.onEscapeKeydown();

		expect(closeSpy).toHaveBeenCalled();
	});

	it('should handle popupService eventPopupOpen$', () => {
		const mockData = { title: 'Test Title', component: MockHostComponent, inputs: { key: 'value' } };
		(
			popupService.eventPopupOpen$ as Subject<{
				title: string;
				component: any;
				inputs?: Record<string, any>;
			}>
		).next(mockData);

		expect(component.isVisible).toBe(true);
		expect(component.title).toBe('Test Title');
	});

	it('should handle popupService eventPopupClose$', () => {
		component.isVisible = true;
		(popupService.eventPopupClose$ as Subject<void>).next();

		expect(component.isVisible).toBe(false);
		expect(popupService.hide).toHaveBeenCalled();
	});
});
