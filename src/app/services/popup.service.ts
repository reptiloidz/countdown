import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class PopupService {
	private _eventPopupOpenSubject = new Subject<{
		title: string;
		component: any;
	}>();
	eventPopupOpen$ = this._eventPopupOpenSubject.asObservable();

	show(title: string, component: any) {
		this._eventPopupOpenSubject.next({ title, component });
	}
}
