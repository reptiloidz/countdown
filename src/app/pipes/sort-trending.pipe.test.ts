import { SortTrendingPipe } from './sort-trending.pipe';
import { SortTypes } from '../types';

describe('SortTrendingPipe', () => {
	let pipe: SortTrendingPipe;

	beforeEach(() => {
		pipe = new SortTrendingPipe();
	});

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should return the correct icon and title for ascending sort type', () => {
		const sortType: SortTypes = 'closestAsc';
		const result = pipe.transform(sortType);
		expect(result).toEqual({
			icon: 'arrow-small-up',
			title: 'По возрастанию',
		});
	});

	it('should return the correct icon and title for descending sort type', () => {
		const sortType: SortTypes = 'closestDesc';
		const result = pipe.transform(sortType);
		expect(result).toEqual({
			icon: 'arrow-small-down',
			title: 'По убыванию',
		});
	});

	it('should return the correct icon and title for sort type containing "Asc"', () => {
		const sortType: SortTypes = 'directionAsc';
		const result = pipe.transform(sortType);
		expect(result).toEqual({
			icon: 'arrow-small-up',
			title: 'По возрастанию',
		});
	});

	it('should return the correct icon and title for sort type not containing "Asc"', () => {
		const sortType: SortTypes = 'directionDesc';
		const result = pipe.transform(sortType);
		expect(result).toEqual({
			icon: 'arrow-small-down',
			title: 'По убыванию',
		});
	});
});
