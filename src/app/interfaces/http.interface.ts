import { Observable } from 'rxjs';
import { Event } from './event.interface';

export interface HttpServiceInterface {
	getEvents(): Observable<Event[]>;
}
