import { Injectable } from '@angular/core';
import { Observable, of, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { Point } from '../interfaces/point.interface';
import { HttpService } from './http.service';

@Injectable({
	providedIn: 'root',
})
export class DataService {
	private _points: Point[] = [];
	private subscriptions: Subscription = new Subscription();

	private _eventFetchAllPointsSubject = new BehaviorSubject<Point[]>(
		this._points
	);
	private _eventEditPointSubject = new Subject<Point>();
	private _eventAddPointSubject = new Subject<Point>();
	private _eventRemovePointSubject = new Subject<string | undefined>();

	eventFetchAllPoints$ = this._eventFetchAllPointsSubject.asObservable();
	eventAddPoint$ = this._eventAddPointSubject.asObservable();
	eventEditPoint$ = this._eventEditPointSubject.asObservable();
	eventRemovePoint$ = this._eventRemovePointSubject.asObservable();

	constructor(private http: HttpService) {
		this.subscriptions.add(
			this.eventFetchAllPoints$.subscribe({
				next: (points) => {
					this.points = points;
				},
			})
		);

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
					this.points = this.points.filter(
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

	fetchAllPoints() {
		this.http.getPoints().subscribe({
			next: (points) => {
				this._eventFetchAllPointsSubject.next(points);
			},
			error: (err) => {
				console.log('Ошибка при загрузке событий', err);
			},
		});
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
				next: (id) => {
					this._eventAddPointSubject.next({ ...point, id });
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
