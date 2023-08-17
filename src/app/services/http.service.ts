import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Point } from '../interfaces/point.interface';
import { HttpServiceInterface } from '../interfaces/http.interface';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class HttpService implements HttpServiceInterface {
	constructor(private http: HttpClient) {}

	getPoints(): Observable<Point[]> {
		return this.http
			.get<Point[]>(`${environment.fbDbUrl}/points.json`)
			.pipe(
				map((response: { [key: string]: any }) => {
					return Object.keys(response).map((key) => ({
						...response[key],
						id: key,
						date: new Date(response[key].date),
					}));
				})
			);
	}

	getPoint(id: string): Observable<Point> {
		return this.http
			.get<Point>(`${environment.fbDbUrl}/points/${id}.json`)
			.pipe(
				map((point: Point) => {
					return {
						...point,
						id,
					};
				})
			);
	}

	postPoint(point: Point | undefined): Observable<Point> {
		return this.http.post<Point>(
			`${environment.fbDbUrl}/points.json`,
			point
		);
	}

	editPoint(point: Point): Observable<Point> {
		return this.http.patch<Point>(
			`${environment.fbDbUrl}/points/${point.id}.json`,
			point
		);
	}
}
