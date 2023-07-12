import { Injectable } from '@angular/core';
import { Point } from '../interfaces/point.interface';

@Injectable({
	providedIn: 'root',
})
export class DataService {
	private _points: Point[] = [];

	set points(points: Point[]) {
		this._points = points;
	}

	get points() {
		return this._points;
	}

	addPoint(point: Point | undefined) {
		if (point && !this._points.find((item) => item.id !== point?.id)) {
			this._points.push(point);
		}
	}
}
