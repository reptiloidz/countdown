import { TestBed } from '@angular/core/testing';
import { PointsStore } from './points.store';
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

const mockPoint2: Point = { ...mockPoint, id: '2', title: 'second' };

describe('PointsStore', () => {
	let store: PointsStore;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		store = TestBed.inject(PointsStore);
	});

	it('should start empty', () => {
		expect(store.points()).toEqual([]);
		expect(store.loading()).toBe(false);
	});

	it('should set and replace points', () => {
		store.setPoints([mockPoint]);
		expect(store.points()).toEqual([mockPoint]);
	});

	it('should add point without duplicates', () => {
		store.addPoint(mockPoint);
		store.addPoint(mockPoint);
		expect(store.points()).toHaveLength(1);
	});

	it('should update point by id', () => {
		store.setPoints([mockPoint]);
		store.updatePoint({ ...mockPoint, title: 'updated' });
		expect(store.points()[0].title).toBe('updated');
	});

	it('should remove point by id', () => {
		store.setPoints([mockPoint, mockPoint2]);
		store.removePoint('1');
		expect(store.points()).toEqual([mockPoint2]);
	});

	it('should set loading flag', () => {
		store.setLoading(true);
		expect(store.loading()).toBe(true);
	});
});
