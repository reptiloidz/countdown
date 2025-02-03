import { TestBed } from '@angular/core/testing';
import { ActionService } from './action.service';

describe('ActionService', () => {
	let service: ActionService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ActionService],
		});
		service = TestBed.inject(ActionService);
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
	});

	it('should emit false when hasEditablePoints is called with false', done => {
		service.eventHasEditablePoints$.subscribe(hasEditablePoints => {
			expect(hasEditablePoints).toBe(false);
			done();
		});

		service.hasEditablePoints(false);
	});
});
