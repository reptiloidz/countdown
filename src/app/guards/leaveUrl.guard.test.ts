import { NO_ERRORS_SCHEMA } from '@angular/core';
import { leaveUrlGuard } from './leaveUrl.guard';
import { Router, UrlSegment } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

describe('leaveUrlGuard', () => {
	let router: Partial<Router>;

	const createUrlSegment = (path: string): UrlSegment => ({
		path,
		parameters: {},
		parameterMap: {
			has: () => false,
			get: () => null,
			getAll: () => [],
			keys: [],
		},
	});

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: Router,
					useValue: {
						navigate: jest.fn(),
						events: new Subject(),
						lastSuccessfulNavigation: {
							finalUrl: {
								root: {
									children: {
										primary: {
											segments: [{ path: 'edit' }, { path: '1' }],
										},
									},
								},
							},
						},
						getCurrentNavigation: jest.fn().mockReturnValue({
							finalUrl: {
								root: {
									children: {
										primary: {
											segments: [{ path: 'edit' }, { path: '1' }],
										},
									},
								},
							},
						}),
					},
				},
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		router = TestBed.inject(Router);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('должен показать confirm, если path === "url" и нет query param date', () => {
		const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

		if (router.lastSuccessfulNavigation?.finalUrl) {
			router.lastSuccessfulNavigation.finalUrl.root.children['primary'].segments = [createUrlSegment('url')];
			router.lastSuccessfulNavigation.finalUrl.queryParams = {};
		}

		const result = TestBed.runInInjectionContext(() => leaveUrlGuard());

		expect(confirmSpy).toHaveBeenCalledWith('Покидая страницу, вы сбросите таймер. Продолжить?');
		expect(result).toBe(true);
	});

	it('должен возвращать true, если path !== "url"', () => {
		const primary = router.lastSuccessfulNavigation?.finalUrl?.root.children['primary'];
		if (primary) {
			primary.segments = [createUrlSegment('home')];
		}

		const result = TestBed.runInInjectionContext(() => leaveUrlGuard());

		expect(result).toBe(true);
	});

	it('должен возвращать true, если есть query param date', () => {
		if (router.lastSuccessfulNavigation?.finalUrl) {
			router.lastSuccessfulNavigation.finalUrl.queryParams = { date: '2024-01-01' };
		}

		const result = TestBed.runInInjectionContext(() => leaveUrlGuard());

		expect(result).toBe(true);
	});
});
