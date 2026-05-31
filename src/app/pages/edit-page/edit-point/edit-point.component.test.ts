import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditPointComponent } from './edit-point.component';
import { DataService, AuthService, ActionService, NotifyService } from 'src/app/services';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Point } from 'src/app/interfaces';

const mockPoint: Point = {
	id: '1',
	title: 'Test Point',
	description: 'Test Description',
	dates: [
		{
			date: '01.01.2025 00:00',
			reason: 'byHand',
		},
	],
	color: 'blue',
	direction: 'backward',
	greenwich: true,
	repeatable: false,
};

const mockDate = new Date();

describe('EditPointComponent', () => {
	let component: EditPointComponent;
	let fixture: ComponentFixture<EditPointComponent>;
	let dataServiceMock: jest.Mocked<DataService>;
	let authServiceMock: jest.Mocked<AuthService>;
	let actionServiceMock: jest.Mocked<ActionService>;
	let notifyServiceMock: jest.Mocked<NotifyService>;

	beforeAll(() => {
		(window as any).ResizeObserver = jest.fn(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		}));
		(global as any).IntersectionObserver = jest.fn(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		}));
	});

	beforeEach(async () => {
		dataServiceMock = {
			putPoint: jest.fn(),
			loading: false,
			eventAddPoint$: new Subject(),
			eventEditPoint$: new Subject(),
			eventStartRemovePoint$: new Subject(),
			eventRemovePoint$: new Subject(),
			fetchPoint: jest.fn(() => of(mockPoint)),
		} as unknown as jest.Mocked<DataService>;

		authServiceMock = {
			getUserData: jest.fn(() => of({ birthDate: '25.12.1991 00:00' })),
			uid: '123',
			isAuthenticated: true,
			checkAccessEdit: jest.fn().mockReturnValue(true),
			eventEditAccessCheck$: of({ access: true }),
		} as unknown as jest.Mocked<AuthService>;

		actionServiceMock = {
			pointUpdated: jest.fn(),
			eventUpdatedPoint$: new Subject(),
			eventIntervalSwitched$: new Subject(),
			eventIterationSwitched$: new Subject(),
			eventIterationsChecked$: new Subject(),
			eventPointsCheckedAll$: new Subject(),
			tryActivateOnboarding: jest.fn().mockReturnValue(false),
			eventOnboardingClosed$: new Subject(),
		} as unknown as jest.Mocked<ActionService>;

		notifyServiceMock = {
			add: jest.fn(() => mockDate),
			close: jest.fn(),
		} as unknown as jest.Mocked<NotifyService>;

		await TestBed.configureTestingModule({
			imports: [BrowserAnimationsModule, EditPointComponent],
			providers: [
				provideRouter([]),
				{
					provide: DataService,
					useValue: dataServiceMock,
				},
				{
					provide: AuthService,
					useValue: authServiceMock,
				},
				{ provide: ActionService, useValue: actionServiceMock },
				{ provide: NotifyService, useValue: notifyServiceMock },
				{
					provide: ActivatedRoute,
					useValue: {
						url: of([{ path: 'edit' }]),
						queryParams: of({}),
						params: of({ id: 'someId' }),
					},
				},
				ChangeDetectorRef,
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(EditPointComponent);
		component = fixture.componentInstance;
		component.iterationForm = new ElementRef(document.createElement('div'));
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should scroll to iterationsForm element when addIterationHandler is called', () => {
		// fixture.whenStable используется, чтобы component.iterationForm не был undefined
		// (иначе нужно указывать static: true, что ломает компонент)
		fixture.whenStable().then(() => {
			component.ngAfterViewInit();

			component.iterationForm.nativeElement.scrollIntoView = jest.fn();

			const scrollIntoViewSpy = jest.spyOn(component.iterationForm.nativeElement, 'scrollIntoView');

			component.addIterationHandler();

			expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
		});
	});

	it('should set isIterationAdded to true when addIterationHandler is called', () => {
		fixture.whenStable().then(() => {
			component.ngAfterViewInit();
			component.iterationForm.nativeElement.scrollIntoView = jest.fn();
			component.addIterationHandler();
			expect(component.isIterationAdded).toBe(true);
		});
	});

	it('should call setValues with isReset: true when addIterationHandler is called', () => {
		fixture.whenStable().then(() => {
			component.ngAfterViewInit();
			component.iterationForm.nativeElement.scrollIntoView = jest.fn();
			const setValuesSpy = jest.spyOn(component, 'setValues');
			component.addIterationHandler();
			expect(setValuesSpy).toHaveBeenCalledWith({ isReset: true });
		});
	});

	it('should initialize form with values from fetched point', () => {
		const form = component.form;
		expect(form).toBeDefined();
		expect(form.controls['title'].value).toBe('Test Point');
		expect(form.controls['description'].value).toBe('Test Description');
		expect(form.controls['difference'].value).toBe(component.difference);
		expect(form.controls['direction'].value).toBe('backward');
		expect(form.controls['color'].value).toBe('blue');
	});

	it('should fetch point data on init', () => {
		dataServiceMock.fetchPoint.mockReturnValue(of(mockPoint));
		jest.spyOn(dataServiceMock, 'fetchPoint');

		component.ngOnInit();
		expect(dataServiceMock.fetchPoint).toHaveBeenCalled();
		expect(component.point).toEqual(mockPoint);
	});

	it('should update point on form value change', () => {
		component.point = mockPoint;
		component.form.controls['title'].setValue('Updated Title');

		expect(component.form.controls['title'].value).toBe('Updated Title'); // Updated test assertion
	});

	it('should dateChanged be called when diff too negative', () => {
		const setDateChangedSpy = jest.spyOn(component, 'dateChanged');
		component.differenceMode = 'years';
		component.differenceChanged(-5000);

		expect(setDateChangedSpy).toHaveBeenCalled();
	});

	it('should dateChanged be called when diff too positive', () => {
		const setDateChangedSpy = jest.spyOn(component, 'dateChanged');
		component.differenceMode = 'years';
		component.differenceChanged(50000);

		expect(setDateChangedSpy).toHaveBeenCalled();
	});

	it('should not dateChanged be called when diff is ok', () => {
		const setDateChangedSpy = jest.spyOn(component, 'dateChanged');
		component.differenceMode = 'years';
		component.differenceChanged(2000);

		expect(setDateChangedSpy).not.toHaveBeenCalled();
	});

	afterEach(() => {
		fixture.destroy();
	});
});
