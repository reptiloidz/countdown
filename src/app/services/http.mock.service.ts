import { Injectable } from '@angular/core';
import { Observable, of, switchMap, timer } from 'rxjs';
import { Point } from '../interfaces/point.interface';
import { HttpServiceInterface } from '../interfaces/http.interface';

@Injectable({
	providedIn: 'root',
})
export class HttpService implements HttpServiceInterface {
	// https://angular.io/guide/build
	// https://levelup.gitconnected.com/use-angular-mock-services-to-develop-without-a-backend-9eb8c5eef523
	private mockPoints: Point[] = [
		{
			title: 'Рептилоиды',
			description: 'Собрание рептилоидов',
			dates: [
				{
					date: '9/19/2023 10:00',
					reason: 'frequency',
				},
				{
					date: '9/26/2023 10:00',
					reason: 'frequency',
				},
				{
					date: '10/3/2023 10:00',
					reason: 'frequency',
				},
			],
			id: '666',
			direction: 'backward',
			greenwich: true,
			repeatable: true,
		},
		{
			title: 'День без аварии',
			description: 'Время с последней аварии или до нее',
			dates: [
				{
					date: '12/25/1991 15:44',
					reason: 'byHand',
				},
			],
			id: '12',
			direction: 'forward',
			greenwich: false,
			repeatable: true,
		},
		{
			title: 'Релиз ASAP-PDF',
			description:
				'До релиза Колиного фреймворка осталось всего ничего. А может он уже прошел',
			dates: [
				{
					date: '08/05/2023 13:00',
					reason: 'byHand',
				},
			],
			id: '13',
			direction: 'backward',
			greenwich: true,
			repeatable: false,
		},
	];

	getPoints(): Observable<Point[]> {
		return timer(1000).pipe(
			switchMap(() => {
				return of(this.mockPoints);
			})
		);
	}

	getPoint(id: string): Observable<Point> {
		return of(
			this.mockPoints.find((item) => item.id === id) ?? ({} as Point)
		);
	}

	postPoint(point: Point): Observable<string> {
		return timer(1000).pipe(
			switchMap(() => {
				return of(new Date().getTime().toString());
			})
		);
	}

	patchPoint(point: Point): Observable<Point> {
		return timer(1000).pipe(
			switchMap(() => {
				return of(point);
			})
		);
	}

	deletePoint(): Observable<void> {
		return timer(1000).pipe(
			switchMap(() => {
				return of(undefined);
			})
		);
	}
}
