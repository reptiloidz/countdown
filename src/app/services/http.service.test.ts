import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpService } from './http.service';
import { Auth } from '@angular/fire/auth';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';
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

describe('HttpService', () => {
	let service: HttpService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientTestingModule,
				provideFirebaseApp(() => initializeApp()),
				provideDatabase(() => getDatabase()),
			],
			providers: [HttpService, { provide: Auth, useValue: mockAuth }],
		});

		service = TestBed.inject(HttpService);
		httpMock = TestBed.inject(HttpTestingController);
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
});
