import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Point } from '../interfaces';

@Injectable({
	providedIn: 'root',
})
export class ActionService {
	private _eventPointsCheckedAllSubject = new Subject<boolean>();
	private _eventPointsCheckedSubject = new Subject<boolean>();
	private _eventIterationSwitchedSubject = new Subject<Date>();
	private _eventFetchedPointsSubject = new Subject<void>();
	private _eventUpdatedPointSubject = new BehaviorSubject<Point | undefined>(
		undefined
	);
	private _eventHasEditablePointsSubject = new Subject<boolean>();
	private _eventIntervalSwitchedSubject = new Subject<void>();
	eventPointsCheckedAll$ = this._eventPointsCheckedAllSubject.asObservable();
	eventPointsChecked$ = this._eventPointsCheckedSubject.asObservable();
	eventIterationSwitched$ =
		this._eventIterationSwitchedSubject.asObservable();
	eventFetchedPoints$ = this._eventFetchedPointsSubject.asObservable();
	eventUpdatedPoint$ = this._eventUpdatedPointSubject.asObservable();
	eventHasEditablePoints$ =
		this._eventHasEditablePointsSubject.asObservable();
	eventIntervalSwitched$ = this._eventIntervalSwitchedSubject.asObservable();

	pointsChecked: string[] = [];

	get checkedPoints() {
		return this.pointsChecked;
	}

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

	pointsFetched() {
		this._eventFetchedPointsSubject.next();
	}

	pointUpdated(point: Point) {
		this._eventUpdatedPointSubject.next(point);
	}

	hasEditablePoints(has: boolean) {
		this._eventHasEditablePointsSubject.next(has);
	}

	intervalSwitched() {
		this._eventIntervalSwitchedSubject.next();
	}

	iterationSwitched(date: Date) {
		this._eventIterationSwitchedSubject.next(date);
	}
}
