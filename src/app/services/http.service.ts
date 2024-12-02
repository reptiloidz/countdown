import { Injectable } from '@angular/core';
import {
	map,
	Observable,
	switchMap,
	combineLatest,
	take,
	mergeMap,
	from,
} from 'rxjs';
import { Point, HttpServiceInterface, Link } from '../interfaces';
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
	update,
} from '@angular/fire/database';
import { Auth, user } from '@angular/fire/auth';
import Sqids from 'sqids';
import { parseDate } from '../helpers';

@Injectable({
	providedIn: 'root',
})
export class HttpService implements HttpServiceInterface {
	constructor(private authFB: Auth) {}

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
									date: parseDate(response[key].date),
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
									date: parseDate(response[key].date),
							  }))
							: [];
					})
				);

				/**
				 * Из-за ограничений Firebase фильтрация данных осуществляется на клиенте,
				 * при этом выполняется 2 запроса данных.
				 * Потому что это 2 отдельных набора событий, которые пересекаются лишь частично,
				 * либо вообще не пересекаются.
				 */
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

	patchPoint(point: Point): Promise<any> {
		return set(ref(this.db, `points/${point?.id}`), point);
	}

	async deletePoints(points: string[]): Promise<void> {
		if (points.length === 1 && points[0] === '') {
			return new Promise((resolve) => {
				resolve();
			});
		} else {
			await (points.length
				? update(
						ref(this.db, `points/`),
						points.reduce((acc: any, currentValue) => {
							acc[currentValue] = null;
							return acc;
						}, {})
				  )
				: null);
			return await new Promise((resolve) => {
				resolve();
			});
		}
	}

	getShortLink(full: string): Observable<string> {
		return objectVal<Link>(
			query(
				ref(this.db, 'links'),
				orderByChild('full'),
				equalTo(full || null)
			)
		).pipe(
			take(1),
			map((link: Link) => link && Object.values(link)[0].short)
		);
	}

	getFullLink(short: string): Observable<string> {
		return objectVal<Link>(
			query(
				ref(this.db, 'links'),
				orderByChild('short'),
				equalTo(short || null)
			)
		).pipe(
			take(1),
			map((link: Link) => Object.values(link)[0].full)
		);
	}

	postShortLink(full: string): Observable<Link> {
		return objectVal<string>(query(child(ref(this.db), 'links'))).pipe(
			take(1),
			mergeMap((links) => {
				return from(
					push(ref(this.db, 'links'), {
						full,
						short: new Sqids({
							minLength: 6,
						}).encode(links ? [Object.keys(links).length] : [0]),
					} as Link)
				);
			}),
			mergeMap((data) => objectVal<Link>(data))
		);
	}

	get db() {
		return getDatabase();
	}
}
