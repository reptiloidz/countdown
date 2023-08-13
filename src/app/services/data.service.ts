import { Injectable } from '@angular/core';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { Point } from '../interfaces/point.interface';
import { HttpService } from './http.service';

@Injectable({
	providedIn: 'root',
})
export class DataService {
	private _points: Point[] = [];
	private _eventChangePointSubject = new Subject<Point>();
	private subscriptions: Subscription = new Subscription();

	eventChangePoint$ = this._eventChangePointSubject.asObservable();

	constructor(private http: HttpService) {
		this.subscriptions.add(
			this.http.eventAddPoint$.subscribe({
				next: (point) => {
					this._points.push(point);
				},
			})
		);

		this.subscriptions.add(
			this.http.eventEditPoint$.subscribe((updatedPoint) => {
				const index = this._points.findIndex(
					(item) => item.id === updatedPoint.id
				);
				if (index !== -1) {
					this._points[index] = updatedPoint;
					this._eventChangePointSubject.next(updatedPoint);
				}
			})
		);
	}

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
			this.http.addPoint(point);
		}
	}

	editPoint(id: string | undefined, point: Point) {
		if (id) {
			this.http.editPoint(point);
		}
	}
}
