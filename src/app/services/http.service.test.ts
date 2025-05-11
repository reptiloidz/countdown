import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpService } from './http.service';
import { Auth, user } from '@angular/fire/auth';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getDatabase, provideDatabase, objectVal } from '@angular/fire/database';
import { of } from 'rxjs';

const mockAuth = {
	currentUser: {
		uid: 'test-user',
		displayName: 'Test User',
		email: 'test@example.com',
	},
	signInWithEmailAndPassword: jest.fn(),
	signOut: jest.fn(),
};

jest.mock('@angular/fire/auth', () => {
	const originalModule = jest.requireActual('@angular/fire/auth');
	return {
		...originalModule,
		user: jest.fn(),
	};
});

jest.mock('@angular/fire/database', () => {
	const originalModule = jest.requireActual('@angular/fire/database');
	return {
		...originalModule,
		objectVal: jest.fn(),
		getDatabase: jest.fn().mockReturnValue({}),
		ref: jest.fn(() => ({})),
		query: jest.fn((ref, ...modifiers) => {
			const queryParams = modifiers.reduce((acc, cur) => {
				return { ...acc, ...(cur._queryParams ?? {}) };
			}, {});
			return { _queryParams: queryParams };
		}),
		child: jest.fn(() => ({})),
		orderByChild: jest.fn((key: string) => ({ _queryParams: { orderByChild: key } })),
		equalTo: jest.fn((value: any) => ({ _queryParams: { equalTo: value } })),
	};
});

describe('HttpService', () => {
	let service: HttpService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideHttpClientTesting(),
				HttpService,
				{ provide: Auth, useValue: mockAuth },
				provideFirebaseApp(() => initializeApp()),
				provideDatabase(() => getDatabase()),
			],
		});

		service = TestBed.inject(HttpService);
		httpMock = TestBed.inject(HttpTestingController);

		(user as jest.Mock).mockReturnValue(of({ uid: 'test-user' }));
		(getDatabase as jest.Mock).mockReturnValue({});
		(objectVal as jest.Mock).mockImplementation((query: any) => {
			if (query._queryParams?.equalTo === 'test-user') {
				return of({
					point1: {
						user: 'test-user',
						public: false,
						date: '2024-04-20T10:00:00Z',
					},
				});
			}

			if (query._queryParams?.equalTo === true) {
				return of({
					point2: {
						user: 'another-user',
						public: true,
						date: '2024-04-19T10:00:00Z',
					},
				});
			}

			return of({});
		});
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should get full link by short link', done => {
		const shortLink = 'short123';
		const fullLink = 'https://example.com/full-link';

		jest.spyOn(service, 'getFullLink').mockReturnValue(of(fullLink));

		service.getFullLink(shortLink).subscribe(link => {
			expect(link).toEqual(fullLink);
			done();
		});
	});

	it('should return user and public points merged without duplicates', done => {
		jest.spyOn(service, 'db', 'get').mockReturnValue({} as any);

		service.getPoints().subscribe(points => {
			expect(points.length).toBe(2);
			expect(points.find(p => p.id === 'point1')?.user).toBe('test-user');
			done();
		});
	});

	it('should get a single point by ID', done => {
		const mockPoint = { user: 'test-user', public: false, date: '2024-04-20T10:00:00Z' };
		(objectVal as jest.Mock).mockReturnValueOnce(of(mockPoint));

		service.getPoint('point1').subscribe(result => {
			expect(result.id).toBe('point1');
			expect(result.user).toBe('test-user');
			done();
		});
	});

	it('should post a new point and return the key', async () => {
		const mockKey = { key: 'new-point-id' };
		const pushMock = jest.fn().mockResolvedValue(mockKey);
		jest.spyOn(service, 'db', 'get').mockReturnValue({} as any);
		require('@angular/fire/database').push = pushMock;

		const result = await service.postPoint({ user: 'u', public: true } as any);
		expect(result).toBe('new-point-id');
		expect(pushMock).toHaveBeenCalled();
	});

	it('should patch a point by ID', async () => {
		const setMock = jest.fn().mockResolvedValue(undefined);
		require('@angular/fire/database').set = setMock;

		const point = { id: '123', user: 'test' } as any;
		await service.patchPoint(point);

		expect(setMock).toHaveBeenCalledWith(expect.anything(), point);
	});

	it('should delete multiple points', async () => {
		const updateMock = jest.fn().mockResolvedValue(undefined);
		require('@angular/fire/database').update = updateMock;

		await service.deletePoints(['1', '2']);
		expect(updateMock).toHaveBeenCalledWith(expect.anything(), {
			'1': null,
			'2': null,
		});
	});

	it('should do nothing if points array is [""]', async () => {
		const updateMock = jest.fn();
		require('@angular/fire/database').update = updateMock;

		await service.deletePoints(['']);
		expect(updateMock).not.toHaveBeenCalled();
	});

	it('should get a short link from full link', done => {
		const full = 'https://test.com/page';
		const mockLinks = { abc123: { short: 'xyz789' } };

		(objectVal as jest.Mock).mockReturnValueOnce(of(mockLinks));

		service.getShortLink(full).subscribe(link => {
			expect(link).toBe('xyz789');
			done();
		});
	});

	it('should get full link from short link', done => {
		const short = 'abc123';
		const mockLinks = { xyz789: { full: 'https://test.com/page' } };

		(objectVal as jest.Mock).mockReturnValueOnce(of(mockLinks));

		service.getFullLink(short).subscribe(link => {
			expect(link).toBe('https://test.com/page');
			done();
		});
	});

	it('should post a short link and return the created link', done => {
		const full = 'https://test.com/page';
		const links = { a: {}, b: {} }; // уже 2 ссылки
		const short = 'abc123';
		const objectValMock = objectVal as jest.Mock;

		objectValMock
			.mockReturnValueOnce(of(links)) // получить все ссылки
			.mockReturnValueOnce(of({ full, short })); // вернуть созданную

		require('@angular/fire/database').push = jest.fn(() => Promise.resolve({ key: 'id123' }));
		require('sqids').default = jest.fn().mockImplementation(() => ({
			encode: () => short,
		}));

		service.postShortLink(full).subscribe(link => {
			expect(link.short).toBe(short);
			expect(link.full).toBe(full);
			done();
		});
	});
});
