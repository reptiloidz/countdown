import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { Point } from '../interfaces/point.interface';
import { HttpServiceInterface } from '../interfaces/http.interface';

@Injectable({
	providedIn: 'root',
})
export class MockHttpService implements HttpServiceInterface {
	// https://angular.io/guide/build
	// https://levelup.gitconnected.com/use-angular-mock-services-to-develop-without-a-backend-9eb8c5eef523
	private mockPoints: Point[] = [
		{
			title: 'День без аварии',
			description: 'Время с последней аварии или до нее',
			date: '12.25.1991 15:44',
			id: '12',
			direction: 'forward',
		},
		{
			title: 'Релиз ASAP-PDF',
			description:
				'До релиза Колиного фреймворка осталось всего ничего. А может он уже прошел',
			date: '08.05.2023 13:00',
			id: '13',
			direction: 'backward',
		},
	];

	private _eventAddPointSubject = new Subject<Point>();
	private _eventEditPointSubject = new Subject<Point>();

	eventAddPoint$ = this._eventAddPointSubject.asObservable();
	eventEditPoint$ = this._eventEditPointSubject.asObservable();

	getPoints(): Observable<Point[]> {
		return of(this.mockPoints);
	}

	getPoint(id: string): Observable<Point> {
		return of(
			this.mockPoints.find((item) => item.id === id) ?? ({} as Point)
		);
	}

	addPoint(point: Point) {
		this._eventAddPointSubject.next(point);
	}

	editPoint(point: Point) {
		this._eventEditPointSubject.next(point);
	}
}
