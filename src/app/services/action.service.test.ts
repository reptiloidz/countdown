import { TestBed } from '@angular/core/testing';
import { ActionService } from './action.service';
import { UiStore } from '../state/ui.store';
import { Point } from '../interfaces';

describe('ActionService', () => {
	let service: ActionService;
	let uiStore: UiStore;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ActionService],
		});
		service = TestBed.inject(ActionService);
		uiStore = TestBed.inject(UiStore);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should emit value when hasEditablePoints is called', done => {
		service.eventHasEditablePoints$.subscribe(hasEditablePoints => {
			expect(hasEditablePoints).toBe(true);
			done();
		});

		service.hasEditablePoints(true);
		expect(uiStore.hasEditablePoints()).toBe(true);
	});

	it('should emit false when hasEditablePoints is called with false', done => {
		service.eventHasEditablePoints$.subscribe(hasEditablePoints => {
			expect(hasEditablePoints).toBe(false);
			done();
		});

		service.hasEditablePoints(false);
		expect(uiStore.hasEditablePoints()).toBe(false);
	});

	it('should update UiStore when pointUpdated is called', () => {
		const point = { id: '1' } as Point;
		service.pointUpdated(point);
		expect(uiStore.updatedPoint()).toBe(point);
	});
});
