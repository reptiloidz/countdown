import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Point } from '../interfaces/point.interface';
import { HttpService } from './http.service';

@Injectable({
	providedIn: 'root',
})
export class DataService {
	_points: Point[] = [];

	constructor(private http: HttpService) {}

	set points(points: Point[]) {
		this._points = points;
	}

	get points() {
		return this._points;
	}

	fetchPoint(id: string): Observable<Point | undefined> {
		if (!this.points.find((item) => item.id === id)) {
			return this.http.getPoint(id);
		}
		return of(this.points.find((item) => item.id === id));
	}

	addPoint(point: Point | undefined) {
		if (point && !this._points.find((item) => item.id === point?.id)) {
			this._points.push(point);
		}
	}

	editPoint(id: string | undefined, point: Point) {
		if (!id) return;
		this._points[this._points.findIndex((item) => item.id === id)] = {
			...point,
			id,
		};
	}
}
