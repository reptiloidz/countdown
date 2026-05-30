import { Injectable } from '@angular/core';
import { Observable, of, Subject, Subscription, distinctUntilChanged } from 'rxjs';
import { Iteration, Point } from '../interfaces';
import { ActionService, HttpService, NotifyService } from '.';
import { EditPointEvent } from '../types';
import { format, startOfDay } from 'date-fns';
import { getPointDate } from '../helpers';
import { Constants } from '../enums';
import { PointsStore } from '../state/points.store';

@Injectable({
	providedIn: 'root',
})
export class DataService {
	private subscriptions = new Subscription();

	private _eventFetchAllPointsSubject = new Subject<Point[]>();
	private _eventAddPointSubject = new Subject<Point>();
	private _eventEditPointSubject = new Subject<[Point, EditPointEvent, Iteration?]>();
	private _eventStartEditPointSubject = new Subject<void>();
	private _eventRemovePointSubject = new Subject<string | undefined>();
	private _eventStartRemovePointSubject = new Subject<string>();

	eventFetchAllPoints$ = this._eventFetchAllPointsSubject.asObservable();
	eventAddPoint$ = this._eventAddPointSubject.asObservable();
	eventEditPoint$ = this._eventEditPointSubject.asObservable();
	eventStartEditPoint$ = this._eventStartEditPointSubject.asObservable();
	eventRemovePoint$ = this._eventRemovePointSubject.asObservable();
	eventStartRemovePoint$ = this._eventStartRemovePointSubject.asObservable();

	constructor(
		private http: HttpService,
		private notify: NotifyService,
		private action: ActionService,
		private pointsStore: PointsStore,
	) {
		this.subscriptions.add(
			this.eventFetchAllPoints$.subscribe({
				next: points => {
					this.pointsStore.setPoints(points);
				},
				error: err => {
					console.error('Ошибка при сохранении списка событий:\n', err.message);
				},
			}),
		);

		this.subscriptions.add(
			this.eventAddPoint$.subscribe({
				next: point => {
					this.pointsStore.addPoint(point);
				},
				error: err => {
					console.error('Ошибка при сохранении события в список:\n', err.message);
				},
			}),
		);

		this.subscriptions.add(
			this.eventEditPoint$.pipe(distinctUntilChanged()).subscribe({
				next: ([updatedPoint]) => {
					this.pointsStore.updatePoint(updatedPoint);
				},
				error: err => {
					console.error('Ошибка при редактировании события в списке:\n', err.message);
				},
			}),
		);

		this.subscriptions.add(
			this.eventRemovePoint$.subscribe({
				next: id => {
					this.pointsStore.removePoint(id);
				},
				error: err => {
					console.error('Ошибка при удалении события из списка:\n', err.message);
				},
			}),
		);
	}

	set points(points: Point[]) {
		this.pointsStore.setPoints(points);
	}

	get points(): Point[] {
		return this.pointsStore.points();
	}

	set loading(isLoading: boolean) {
		this.pointsStore.setLoading(isLoading);
	}

	get loading(): boolean {
		return this.pointsStore.loading();
	}

	fetchAllPoints() {
		this.http.getPoints().subscribe({
			next: points => {
				this._eventFetchAllPointsSubject.next(points);
			},
			error: err => {
				console.error('Ошибка при загрузке событий:\n', err.message);
			},
		});
	}

	fetchPoint(id: string): Observable<Point | undefined> {
		if (!this.points.find(item => item.id === id)) {
			return this.http.getPoint(id);
		}
		return of(this.points.find(item => item.id === id));
	}

	putPoint(point: Point) {
		this.pointsStore.putPoint(point);
	}

	addPoint(point: Point | undefined) {
		if (point && !this.points.find(item => item.id === point?.id)) {
			this.http
				.postPoint(point)
				.then(id => {
					this._eventAddPointSubject.next({ ...point, id });
				})
				.catch(err => {
					this.notify.add({
						title: 'Ошибка при создании события',
						view: 'negative',
					});

					console.error('Ошибка при создании события:\n', err.message);
				});
		}
	}

	editPoint(
		id: string | undefined,
		point: Point,
		editPointEvent: EditPointEvent = 'pointEdited',
		newIteration?: Iteration,
	) {
		if (id) {
			this.loading = true;
			this._eventStartEditPointSubject.next();
			this.http
				.patchPoint(point)
				.then(() => {
					this._eventEditPointSubject.next([point, editPointEvent, newIteration]);
				})
				.catch(err => {
					this.notify.add({
						title: 'Ошибка при редактировании события',
						view: 'negative',
					});

					console.error('Ошибка при редактировании события:\n', err.message);
				});
		}
	}

	removePoints({
		id,
		list,
	}: {
		id?: string;
		list?: string[];
	} = {}) {
		this.notify
			.confirm({
				title: `Удалить ${id ? 'событие' : 'выбранные события ' + '(' + (list?.length ?? this.action.checkedPoints.length) + ' шт.)'}?`,
			})
			.subscribe({
				next: () => {
					this.loading = true;
					id && this._eventStartRemovePointSubject.next(id);
					this.http
						.deletePoints(id ? [id] : list || this.action.checkedPoints)
						.then(() => {
							this._eventRemovePointSubject.next(id);
						})
						.catch(err => {
							this.notify.add({
								title: 'Ошибка при удалении события',
								view: 'negative',
							});

							console.error('Ошибка при удалении события:\n', err.message);
						});
				},
			});
	}

	setDateNow(point: Point) {
		let newDatesArray = point?.dates;
		let newDate = getPointDate({
			isGreenwich: point.greenwich,
			isInvert: true,
		});
		if (point.dateOnly) {
			newDate = startOfDay(newDate);
		}
		const lastDate = {
			date: format(newDate, Constants.fullDateFormat),
			reason: 'byHand',
		} as Iteration;
		if (point.repeatable) {
			newDatesArray?.push(lastDate);
		} else {
			newDatesArray && (newDatesArray = [lastDate]);
		}
		this.editPoint(point.id, {
			...point,
			dates: newDatesArray,
		} as Point);
	}
}
