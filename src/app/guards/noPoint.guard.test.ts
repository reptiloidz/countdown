import { TestBed } from '@angular/core/testing';
import { noPointGuard } from './noPoint.guard';
import { ActionService } from '../services';

describe('noPointGuard', () => {
	let actionService: ActionService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ActionService],
		});
		actionService = TestBed.inject(ActionService);
		jest.spyOn(actionService, 'pointUpdated');
	});

	it('should call pointUpdated with undefined and return true', () => {
		let result: boolean = false;
		TestBed.runInInjectionContext(() => {
			result = noPointGuard();
		});

		expect(actionService.pointUpdated).toHaveBeenCalledWith(undefined);
		expect(result).toBe(true);
	});
});
