import { Observable } from 'rxjs';
import { Point } from './point.interface';

export interface HttpServiceInterface {
	getPoints(): Observable<Point[]>;
	getPoint(id: string): Observable<Point>;
	postPoint(point: Point): Observable<string>;
	patchPoint(point: Point): Observable<Point>;
	deletePoint(id: string): Observable<void>;
}
