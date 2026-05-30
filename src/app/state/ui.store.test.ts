import { TestBed } from '@angular/core/testing';
import { UiStore } from './ui.store';
import { Point } from '../interfaces';

const mockPoint: Point = {
	id: '1',
	dates: [{ date: '15.01.2025 12:25', reason: 'byHand' }],
	repeatable: true,
	greenwich: false,
	color: 'red',
	direction: 'backward',
	title: 'title',
};

describe('UiStore', () => {
	let store: UiStore;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		store = TestBed.inject(UiStore);
	});

	it('should track checked point ids', () => {
		store.setPointsChecked(['1', '2']);
		expect(store.pointsChecked()).toEqual(['1', '2']);
		expect(store.hasPointsChecked()).toBe(true);
	});

	it('should store updated point', () => {
		store.setUpdatedPoint(mockPoint);
		expect(store.updatedPoint()).toEqual(mockPoint);
	});

	it('should store editable points flag', () => {
		store.setHasEditablePoints(true);
		expect(store.hasEditablePoints()).toBe(true);
	});
});
