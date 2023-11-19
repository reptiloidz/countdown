import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
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
				return objectVal<{ [key: string]: any }>(
					query(
						child(ref(getDatabase()), 'points'),
						orderByChild('user'),
						equalTo(data?.uid || null)
					)
				).pipe(
					map((response: { [key: string]: any }) => {
						return Object.keys(response).map((key) => ({
							...response[key],
							id: key,
							date: new Date(response[key].date),
						}));
					})
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
		await set(ref(getDatabase(), `points/${point.id}`), point);
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
