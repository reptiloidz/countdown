import { Observable } from 'rxjs';
import { Point } from './point.interface';

export interface HttpServiceInterface {
	getPoints(): Observable<Point[]>;
}
