import { Injectable } from '@angular/core';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { Point } from '../interfaces/point.interface';
import { HttpService } from './http.service';

@Injectable({
	providedIn: 'root',
})
export class DataService {
	private _points: Point[] = [];
	private subscriptions: Subscription = new Subscription();

	private _eventEditPointSubject = new Subject<Point>();
	private _eventAddPointSubject = new Subject<Point>();

	eventAddPoint$ = this._eventAddPointSubject.asObservable();
	eventEditPoint$ = this._eventEditPointSubject.asObservable();

	constructor(private http: HttpService) {
		this.subscriptions.add(
			this.eventAddPoint$.subscribe({
				next: (point) => {
					this._points.push(point);
				},
			})
		);

		this.subscriptions.add(
			this.eventEditPoint$.subscribe({
				next: (updatedPoint) => {
					const index = this._points.findIndex(
						(item) => item.id === updatedPoint.id
					);
					if (index !== -1) {
						this._points[index] = updatedPoint;
					}
				},
			})
		);
	}

	set points(points: Point[]) {
		this._points = points;
	}

	get points() {
		return this._points;
	}

	getPointsData(): Observable<Point[]> {
		if (!this.points.length) {
			return this.http.getPoints();
		}
		return of(this.points);
	}

	getPointData(id: string): Observable<Point | undefined> {
		if (!this.points.find((item) => item.id === id)) {
			return this.http.getPoint(id);
		}
		return of(this.points.find((item) => item.id === id));
	}

	addPointData(point: Point | undefined) {
		if (point && !this._points.find((item) => item.id === point?.id)) {
			this.http.postPoint(point).subscribe({
				next: () => {
					this._points.push(point);
					this._eventAddPointSubject.next(point);
				},
			});
		}
	}

	editPointData(id: string | undefined, point: Point) {
		if (id) {
			this.http.editPoint(point).subscribe({
				next: () => {
					this._eventEditPointSubject.next(point);
				},
			});
		}
	}
}
