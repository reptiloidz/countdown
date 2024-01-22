import { Injectable } from '@angular/core';
import { Observable, of, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { Point } from '../interfaces/point.interface';
import { HttpService } from './http.service';
import { NotifyService } from './notify.service';

@Injectable({
	providedIn: 'root',
})
export class DataService {
	private _loading = false;

	private _points: Point[] = [];
	private subscriptions = new Subscription();

	private _eventFetchAllPointsSubject = new BehaviorSubject<Point[]>(
		this._points
	);
	private _eventAddPointSubject = new Subject<Point>();
	private _eventEditPointSubject = new Subject<Point>();
	private _eventStartEditPointSubject = new Subject<void>();
	private _eventRemovePointSubject = new Subject<string | undefined>();
	private _eventStartRemovePointSubject = new Subject<string>();

	eventFetchAllPoints$ = this._eventFetchAllPointsSubject.asObservable();
	eventAddPoint$ = this._eventAddPointSubject.asObservable();
	eventEditPoint$ = this._eventEditPointSubject.asObservable();
	eventStartEditPoint$ = this._eventStartEditPointSubject.asObservable();
	eventRemovePoint$ = this._eventRemovePointSubject.asObservable();
	eventStartRemovePoint$ = this._eventStartRemovePointSubject.asObservable();

	constructor(private http: HttpService, private notify: NotifyService) {
		this.subscriptions.add(
			this.eventFetchAllPoints$.subscribe({
				next: (points) => {
					this.points = points;
				},
				error: (err) => {
					console.error(
						'Ошибка при сохранении списка событий:\n',
						err.message
					);
				},
			})
		);

		this.subscriptions.add(
			this.eventAddPoint$.subscribe({
				next: (point) => {
					this._points.push(point);
				},
				error: (err) => {
					console.error(
						'Ошибка при сохранении события в список:\n',
						err.message
					);
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
				error: (err) => {
					console.error(
						'Ошибка при редактировании события в списке:\n',
						err.message
					);
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
				error: (err) => {
					console.error(
						'Ошибка при удалении события из списка:\n',
						err.message
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

	set loading(isLoading: boolean) {
		this._loading = isLoading;
	}

	get loading() {
		return this._loading;
	}

	fetchAllPoints() {
		this.http.getPoints().subscribe({
			next: (points) => {
				this._eventFetchAllPointsSubject.next(points);
			},
			error: (err) => {
				console.error('Ошибка при загрузке событий:\n', err.message);
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
			this.http
				.postPoint(point)
				.then((id) => {
					this._eventAddPointSubject.next({ ...point, id });
				})
				.catch((err) => {
					this.notify.add({
						title: 'Ошибка при создании события',
					});

					console.error(
						'Ошибка при создании события:\n',
						err.message
					);
				});
		}
	}

	editPoint(id: string | undefined, point: Point) {
		if (id) {
			this.loading = true;
			this._eventStartEditPointSubject.next();
			this.http
				.patchPoint(point)
				.then((point) => {
					this._eventEditPointSubject.next(point);
				})
				.catch((err) => {
					this.notify.add({
						title: 'Ошибка при редактировании события',
					});

					console.error(
						'Ошибка при редактировании события:\n',
						err.message
					);
				});
		}
	}

	removePoint(id: string | undefined) {
		if (id) {
			this.loading = true;
			this._eventStartRemovePointSubject.next(id);

			this.http
				.deletePoint(id)
				.then(() => {
					this._eventRemovePointSubject.next(id);
				})
				.catch((err) => {
					this.notify.add({
						title: 'Ошибка при удалении события',
					});

					console.error(
						'Ошибка при удалении события:\n',
						err.message
					);
				});
		}
	}
}
