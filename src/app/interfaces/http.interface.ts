import { Observable } from 'rxjs';
import { Point } from '.';

export interface HttpServiceInterface {
	getPoints(): Observable<Point[]>;
	getPoint(id: string): Observable<Point>;
	postPoint(point: Point): Promise<string>;
	patchPoint(point: Point): Promise<Point>;
}
