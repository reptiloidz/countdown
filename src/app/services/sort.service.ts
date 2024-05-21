import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Point } from '../interfaces';
import { SortTypes } from '../types';

@Injectable({
	providedIn: 'root',
})
export class SortService {
	sort(points: Point[], sortType: SortTypes) {
		return points.sort((a, b) => {
			switch (sortType) {
				case 'titleAsc':
					return this.compareTitle(a, b);
				case 'titleDesc':
					return this.compareTitle(b, a);
				// case SortTypeNames.userAsc:
				// 	return this.compareUser(a, b);
				// case SortTypeNames.userDesc:
				// 	return this.compareUser(b, a);
				case 'repeatableAsc':
					return this.compareRepeatable(b, a);
				case 'repeatableDesc':
					return this.compareRepeatable(a, b);
				case 'greenwichAsc':
					return this.compareGreenwich(b, a);
				case 'greenwichDesc':
					return this.compareGreenwich(a, b);
				case 'publicAsc':
					return this.comparePublic(b, a);
				case 'publicDesc':
					return this.comparePublic(a, b);
				default:
					return 0;
			}
		});
	}

	compareTitle(a: Point, b: Point) {
		if (a.title > b.title) {
			return 1;
		} else if (a.title < b.title) {
			return -1;
		} else {
			return 0;
		}
	}

	// compareUser(a: Point, b: Point) {
	// TODO: доделать, когда будем хранить имя юзера
	// 	if (a.title > b.title) {
	// 		return 1;
	// 	} else if (a.title < b.title) {
	// 		return -1;
	// 	} else {
	// 		return this.compareTitle(a, b);
	// 	}
	// }

	compareRepeatable(a: Point, b: Point) {
		if (!a.repeatable && b.repeatable) {
			return 1;
		} else if (a.repeatable && !b.repeatable) {
			return -1;
		} else {
			return this.compareTitle(a, b);
		}
	}

	compareGreenwich(a: Point, b: Point) {
		if (!a.greenwich && b.greenwich) {
			return 1;
		} else if (a.greenwich && !b.greenwich) {
			return -1;
		} else {
			return this.compareTitle(a, b);
		}
	}

	comparePublic(a: Point, b: Point) {
		if (!a.public && b.public) {
			return 1;
		} else if (a.public && !b.public) {
			return -1;
		} else {
			return this.compareTitle(a, b);
		}
	}
}