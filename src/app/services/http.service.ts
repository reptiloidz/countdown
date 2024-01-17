import { Injectable } from '@angular/core';
import { map, Observable, switchMap, combineLatest, Subject } from 'rxjs';
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
import { UserExtraData } from '../interfaces/userExtraData.interface';

@Injectable({
	providedIn: 'root',
})
export class HttpService implements HttpServiceInterface {
	constructor(private authFB: Auth) {}

	private _eventBirthDateAddedSubject = new Subject<void>();
	eventBirthDateAdded$ = this._eventBirthDateAddedSubject.asObservable();

	eventBirthDateAdded() {
		this._eventBirthDateAddedSubject.next();
	}

	getPoints(): Observable<Point[]> {
		return user(this.authFB).pipe(
			switchMap((data) => {
				const userPointsQuery = query(
					ref(this.db, 'points'),
					orderByChild('user'),
					equalTo(data?.uid || null)
				);

				const publicPointsQuery = query(
					ref(this.db, 'points'),
					orderByChild('public'),
					equalTo(true)
				);

				const userPoints$ = objectVal<any>(userPointsQuery).pipe(
					map((response: { [key: string]: any }) => {
						return response
							? Object.keys(response).map((key) => ({
									...response[key],
									id: key,
									date: new Date(response[key].date),
							  }))
							: [];
					})
				);

				const publicPoints$ = objectVal<any>(publicPointsQuery).pipe(
					map((response: { [key: string]: any }) => {
						return response
							? Object.keys(response).map((key) => ({
									...response[key],
									id: key,
									date: new Date(response[key].date),
							  }))
							: [];
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
			query(child(ref(this.db), `points/${id}`))
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
		const value: any = await push(ref(this.db, 'points'), point);
		return await new Promise((resolve) => {
			resolve(value.key as string);
		});
	}

	async patchPoint(point: Point): Promise<Point> {
		await set(ref(this.db, `points/${point?.id}`), point);
		return await new Promise((resolve) => {
			resolve(point);
		});
	}

	async deletePoint(id: string | undefined): Promise<void> {
		await (id ? set(ref(this.db, `points/${id}`), null) : null);
		return await new Promise((resolve) => {
			resolve();
		});
	}

	getUserData(id: string): Observable<UserExtraData> {
		return objectVal<any>(query(ref(this.db, `users/${id}`)));
	}

	async updateUserBirthDate(
		id: string,
		param: UserExtraData | null
	): Promise<void> {
		await set(ref(this.db, `users/${id}`), {
			birthDate: param?.birthDate || null,
			birthDatePointId: param?.birthDatePointId || null,
			auth: param?.auth || null,
		} as UserExtraData);
		return await new Promise((resolve) => {
			param && this.eventBirthDateAdded();
			resolve();
		});
	}

	get db() {
		return getDatabase();
	}
}
