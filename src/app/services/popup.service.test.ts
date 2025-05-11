import { TestBed } from '@angular/core/testing';
import { Renderer2, RendererFactory2 } from '@angular/core';
import { PopupService } from './popup.service';

describe('PopupService', () => {
	let service: PopupService;
	let rendererFactory: RendererFactory2;
	let renderer: Renderer2;

	beforeEach(() => {
		const rendererFactoryMock = {
			createRenderer: jest.fn().mockReturnValue({
				addClass: jest.fn(),
				removeClass: jest.fn(),
			}),
		};

		TestBed.configureTestingModule({
			providers: [PopupService, { provide: RendererFactory2, useValue: rendererFactoryMock }],
		});

		service = TestBed.inject(PopupService);
		rendererFactory = TestBed.inject(RendererFactory2);
		renderer = rendererFactory.createRenderer(null, null);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should add class and emit event on show', () => {
		const title = 'Test Title';
		const component = {};
		const inputs = { key: 'value' };

		const addClassSpy = jest.spyOn(renderer, 'addClass');
		const nextSpy = jest.spyOn(service['_eventPopupOpenSubject'], 'next');

		service.show(title, component, inputs);

		expect(addClassSpy).toHaveBeenCalledWith(document.documentElement, 'ov-hidden');
		expect(nextSpy).toHaveBeenCalledWith({ title, component, inputs });
	});

	it('should remove class on hide', () => {
		const removeClassSpy = jest.spyOn(renderer, 'removeClass');

		service.hide();

		expect(removeClassSpy).toHaveBeenCalledWith(document.documentElement, 'ov-hidden');
	});

	it('should emit event on close', () => {
		const nextSpy = jest.spyOn(service['_eventPopupCloseSubject'], 'next');

		service.close();

		expect(nextSpy).toHaveBeenCalled();
	});

	it('should have eventPopupOpen$ observable', done => {
		const title = 'Test Title';
		const component = {};
		const inputs = { key: 'value' };

		service.eventPopupOpen$.subscribe(event => {
			expect(event).toEqual({ title, component, inputs });
			done();
		});

		service.show(title, component, inputs);
	});

	it('should have eventPopupClose$ observable', done => {
		service.eventPopupClose$.subscribe(() => {
			done();
		});

		service.close();
	});
});
