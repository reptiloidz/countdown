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
	private _eventRemovePointSubject = new Subject<string | undefined>();

	eventAddPoint$ = this._eventAddPointSubject.asObservable();
	eventEditPoint$ = this._eventEditPointSubject.asObservable();
	eventRemovePoint$ = this._eventRemovePointSubject.asObservable();

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

		this.subscriptions.add(
			this.eventRemovePoint$.subscribe({
				next: (id) => {
					this._points = this._points.filter(
						(point) => point.id !== id
					);
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

	fetchAllPoints(): Observable<Point[]> {
		if (!this.points.length) {
			return this.http.getPoints();
		}
		return of(this.points);
	}

	fetchPoint(id: string): Observable<Point | undefined> {
		if (!this.points.find((item) => item.id === id)) {
			return this.http.getPoint(id);
		}
		return of(this.points.find((item) => item.id === id));
	}

	addPoint(point: Point | undefined) {
		if (point && !this._points.find((item) => item.id === point?.id)) {
			this.http.postPoint(point).subscribe({
				next: () => {
					this._eventAddPointSubject.next(point);
				},
			});
		}
	}

	editPoint(id: string | undefined, point: Point) {
		id &&
			this.http.patchPoint(point).subscribe({
				next: () => {
					this._eventEditPointSubject.next(point);
				},
			});
	}

	removePoint(id: string | undefined) {
		id &&
			this.http.deletePoint(id).subscribe({
				next: () => {
					this._eventRemovePointSubject.next(id);
				},
			});
	}
}
