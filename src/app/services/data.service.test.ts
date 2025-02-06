import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { ActionService, HttpService, NotifyService } from '.';
import { Point } from '../interfaces';
import { of, take } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

const mockPoints: Point[] = [
	{
		id: '1',
		dates: [
			{
				date: '15.01.2025 12:25',
				reason: 'byHand',
			},
			{
				date: '20.01.2025 16:40',
				reason: 'frequency',
			},
		],
		repeatable: true,
		greenwich: false,
		color: 'red',
		direction: 'backward',
		title: 'title',
	},
];

const mockAuth = {
	currentUser: {
		uid: 'test-user',
		displayName: 'Test User',
		email: 'test@example.com',
	},
	signInWithEmailAndPassword: jest.fn(),
	signOut: jest.fn(),
};

describe('DataService', () => {
	let service: DataService;
	let httpMock: HttpTestingController;
	let httpService: HttpService;
	let notifyService: NotifyService;
	let actionService: ActionService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, provideFirebaseApp(() => initializeApp())],
			providers: [DataService, HttpService, NotifyService, ActionService, { provide: Auth, useValue: mockAuth }],
		});

		service = TestBed.inject(DataService);
		httpMock = TestBed.inject(HttpTestingController);
		httpService = TestBed.inject(HttpService);
		notifyService = TestBed.inject(NotifyService);
		actionService = TestBed.inject(ActionService);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should fetch all points', () => {
		jest.spyOn(httpService, 'getPoints').mockReturnValue(of(mockPoints));

		service.fetchAllPoints();

		service.eventFetchAllPoints$.pipe(take(1)).subscribe(points => {
			expect(points).toEqual(mockPoints);
		});
	});

	it('should fetch a point by id', () => {
		jest.spyOn(httpService, 'getPoint').mockReturnValue(of(mockPoints[0]));

		service
			.fetchPoint('1')
			.pipe(take(1))
			.subscribe(point => {
				expect(point).toEqual(mockPoints[0]);
			});
	});

	it('should add a point', async () => {
		jest.spyOn(httpService, 'postPoint').mockReturnValue(Promise.resolve('1'));
		jest.spyOn(service['_eventAddPointSubject'], 'next');

		await service.addPoint(mockPoints[0]);

		expect(service['_eventAddPointSubject'].next).toHaveBeenCalledWith({ ...mockPoints[0], id: '1' });
	});

	it('should edit a point', async () => {
		jest.spyOn(httpService, 'patchPoint').mockReturnValue(Promise.resolve());
		jest.spyOn(service['_eventEditPointSubject'], 'next');

		await service.editPoint('1', mockPoints[0]);

		expect(service['_eventEditPointSubject'].next).toHaveBeenCalledWith([mockPoints[0], 'pointEdited', undefined]);
	});

	it('should remove a point', async () => {
		jest.spyOn(httpService, 'deletePoints').mockReturnValue(Promise.resolve());
		jest.spyOn(notifyService, 'confirm');
		await service.removePoints({ id: '1' });

		expect(notifyService.confirm).toHaveBeenCalledWith({
			confirm: true,
			title: `Удалить событие?`,
		});
	});

	it('should set date now', () => {
		jest.spyOn(service, 'editPoint');
		jest.spyOn(httpService, 'patchPoint').mockReturnValue(Promise.resolve());

		service.setDateNow(mockPoints[0]);

		expect(service.editPoint).toHaveBeenCalled();
	});
});
