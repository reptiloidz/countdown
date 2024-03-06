import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ActionService {
	private _eventPointsCheckedAllSubject = new Subject<boolean>();
	private _eventPointsCheckedSubject = new Subject<boolean>();
	private _eventIterationSwitchedSubject = new Subject<Date>();
	private _eventFetchedPointsSubject = new Subject<void>();
	eventPointsCheckedAll$ = this._eventPointsCheckedAllSubject.asObservable();
	eventPointsChecked$ = this._eventPointsCheckedSubject.asObservable();
	eventIterationSwitched$ =
		this._eventIterationSwitchedSubject.asObservable();
	eventFetchedPoints$ = this._eventFetchedPointsSubject.asObservable();

	pointsChecked: string[] = [];

	constructor() {}

	getCheckedPoints(el: Element) {
		this.pointsChecked = Array.from(el.children)
			.filter((item: any) => item?.querySelector('input')?.checked)
			.map((item: any) => item.getAttribute('data-id'));
		this._eventPointsCheckedSubject.next(!!this.pointsChecked.length);
	}

	checkAllPoints() {
		this._eventPointsCheckedAllSubject.next(true);
		this._eventPointsCheckedSubject.next(true);
	}

	uncheckAllPoints() {
		this._eventPointsCheckedAllSubject.next(false);
		this._eventPointsCheckedSubject.next(false);
	}

	iterationSwitched(date: Date) {
		this._eventIterationSwitchedSubject.next(date);
	}

	pointsFetched() {
		this._eventFetchedPointsSubject.next();
	}
}
