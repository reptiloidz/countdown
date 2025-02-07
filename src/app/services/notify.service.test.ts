import { TestBed } from '@angular/core/testing';
import { NotifyService } from './notify.service';
import { Notification } from '../interfaces';
import { take } from 'rxjs';

describe('NotifyService', () => {
	let service: NotifyService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(NotifyService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should add a notification', () => {
		const notification: Omit<Notification<boolean>, 'date'> = {
			title: 'Test',
			text: 'This is a test notification',
		};

		const date = service.add(notification);
		expect(service.notifications.length).toBe(1);
		expect(service.notifications[0].title).toBe('Test');
	});

	it('should remove a notification on close', () => {
		const notification: Omit<Notification<boolean>, 'date'> = {
			title: 'Test',
			text: 'This is a test notification',
		};

		const date = service.add(notification);
		service.close(date);
		expect(service.notifications.length).toBe(0);
	});

	it('should handle prompt notifications', done => {
		const notification: Omit<Notification<boolean>, 'date'> = {
			title: 'Prompt',
			text: 'Enter value',
		};

		service
			.prompt(notification)
			.pipe(take(1))
			.subscribe(value => {
				expect(value).toBe('Test input');
				done();
			});

		service['_promptSubject']?.next('Test input'); // Симуляция ввода
	});

	it('should handle confirm notifications', done => {
		const notification: Omit<Notification<boolean>, 'date'> = {
			title: 'Confirm',
			text: 'Are you sure?',
		};

		service
			.confirm(notification)
			.pipe(take(1))
			.subscribe(value => {
				expect(value).toBe(true);
				done();
			});

		service.submit(service.notifications[0].date);
	});
});
