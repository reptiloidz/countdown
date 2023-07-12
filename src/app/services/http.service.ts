import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Point } from '../interfaces/point.interface';
import { HttpServiceInterface } from '../interfaces/http.interface';

@Injectable({
	providedIn: 'root',
})
export class HttpService implements HttpServiceInterface {
	constructor(private http: HttpClient) {}

	getPoints(): Observable<Point[]> {
		return this.http.get<Point[]>('');
	}

	getPoint(id: string): Observable<Point> {
		return this.http.get<Point>('');
	}
}
