import { Observable } from 'rxjs';
import { Point } from './point.interface';

export interface HttpServiceInterface {
	getPoints(): Observable<Point[]>;
	getPoint(id: string): Observable<Point>;
	postPoint(point: Point): Observable<Point>;
	editPoint(point: Point): any;
}
