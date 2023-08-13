import { Observable } from 'rxjs';
import { Point } from './point.interface';

export interface HttpServiceInterface {
	getPoints(): Observable<Point[]>;
	getPoint(id: string): Observable<Point>;
	addPoint(point: Point): any;
	editPoint(point: Point): any;
}
