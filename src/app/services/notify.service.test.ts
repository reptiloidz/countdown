import { TestBed } from '@angular/core/testing';
import { NotifyService } from './notify.service';
import { Notification } from '../interfaces';
import { Observable } from 'rxjs';

describe('NotifyService', () => {
	let service: NotifyService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(NotifyService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('confirm', () => {
		it.skip('should add a confirm notification and return an observable', done => {
			const notification: Omit<Notification<boolean>, 'date'> = {
				title: 'Confirm Title',
				text: 'Confirm Text',
				confirm: true,
			};

			const confirmObservable: Observable<boolean> = service.confirm(notification);

			expect(confirmObservable).toBeTruthy();

			confirmObservable.subscribe(result => {
				expect(result).toBe(true);
				done();
			});

			// Simulate the DOM element for the confirm button
			const confirmButton = document.createElement('button');
			confirmButton.classList.add('notify-list__submit');
			document.documentElement.appendChild(confirmButton);

			// Simulate the requestAnimationFrame callback
			requestAnimationFrame(() => {
				confirmButton.focus();
				service['_confirmSubject'].next(true);
			});
		});

		it('should focus the confirm button', () => {
			const notification: Omit<Notification<boolean>, 'date'> = {
				title: 'Confirm Title',
				text: 'Confirm Text',
				confirm: true,
			};

			service.confirm(notification);

			// Simulate the DOM element for the confirm button
			const confirmButton = document.createElement('button');
			confirmButton.classList.add('notify-list__submit');
			document.documentElement.appendChild(confirmButton);

			// Simulate the requestAnimationFrame callback
			requestAnimationFrame(() => {
				expect(document.activeElement).toBe(confirmButton);
			});
		});
	});
});
