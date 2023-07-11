import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Event } from '../interfaces/event.interface';
import { HttpServiceInterface } from '../interfaces/http.interface';

@Injectable({
	providedIn: 'root',
})
export class MockHttpService implements HttpServiceInterface {
	// https://levelup.gitconnected.com/use-angular-mock-services-to-develop-without-a-backend-9eb8c5eef523
	private mockEvents: Event[] = [
		{
			title: 'Дней без аварии',
			description: 'Время с последней аварии',
			time: 1000000,
		},
		{
			title: 'Релиз ASAP-PDF через',
			description: 'До релиза Колиного фреймворка осталось всего ничего',
			time: 4,
		},
	];

	getEvents(): Observable<Event[]> {
		return of(this.mockEvents);
	}
}
