import { Injectable } from '@angular/core';
import { map, Observable, switchMap, combineLatest } from 'rxjs';
import { Point } from '../interfaces/point.interface';
import { HttpServiceInterface } from '../interfaces/http.interface';
import {
	ref,
	getDatabase,
	objectVal,
	child,
	query,
	equalTo,
	orderByChild,
	set,
	push,
} from '@angular/fire/database';
import { Auth, user } from '@angular/fire/auth';

@Injectable({
	providedIn: 'root',
})
export class HttpService implements HttpServiceInterface {
	constructor(private authFB: Auth) {}

	getPoints(): Observable<Point[]> {
		return user(this.authFB).pipe(
			switchMap((data) => {
				const userPointsQuery = query(
					ref(getDatabase(), 'points'),
					orderByChild('user'),
					equalTo(data?.uid || null)
				);

				const publicPointsQuery = query(
					ref(getDatabase(), 'points'),
					orderByChild('public'),
					equalTo(true)
				);

				const userPoints$ = objectVal<any>(userPointsQuery).pipe(
					map((response: { [key: string]: any }) => {
						return Object.keys(response).map((key) => ({
							...response[key],
							id: key,
							date: new Date(response[key].date),
						}));
					})
				);

				const publicPoints$ = objectVal<any>(publicPointsQuery).pipe(
					map((response: { [key: string]: any }) => {
						return Object.keys(response).map((key) => ({
							...response[key],
							id: key,
							date: new Date(response[key].date),
						}));
					})
				);

				// Из-за ограничений Firebase фильтрация данных осуществляется на клиенте, при этом выполняется 2 запроса данных
				return combineLatest([userPoints$, publicPoints$]).pipe(
					map((results) => results.flat()),
					map((points) =>
						Array.from(
							new Map(
								points.map((point) => [point.id, point])
							).values()
						)
					)
				);
			})
		);
	}

	getPoint(id: string): Observable<Point> {
		return objectVal<Point>(
			query(child(ref(getDatabase()), `points/${id}`))
		).pipe(
			map((point: Point) => {
				return {
					...point,
					id,
				};
			})
		);
	}

	async postPoint(point: Point | undefined): Promise<string> {
		const value: any = await push(ref(getDatabase(), 'points'), point);
		return await new Promise((resolve) => {
			resolve(value.key as string);
		});
	}

	async patchPoint(point: Point): Promise<Point> {
		await set(ref(getDatabase(), `points/${point?.id}`), point);
		return await new Promise((resolve) => {
			resolve(point);
		});
	}

	async deletePoint(id: string | undefined): Promise<void> {
		await set(ref(getDatabase(), `points/${id}`), null);
		return await new Promise((resolve) => {
			resolve();
		});
	}
}
