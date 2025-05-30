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
	private _eventUpdatedPointSubject = new BehaviorSubject<Point | undefined>(undefined);
	private _eventHasEditablePointsSubject = new Subject<boolean>();
	private _eventIntervalSwitchedSubject = new Subject<void>();
	private _eventAutocompleteOpenedSubject = new Subject<void>();
	private _eventShortLinkCheckedSubject = new Subject<void>();
	private _eventOnboardingClosedSubject = new Subject<void>();
	private _eventIterationsCheckedSubject = new Subject<void>();
	eventPointsCheckedAll$ = this._eventPointsCheckedAllSubject.asObservable();
	eventPointsChecked$ = this._eventPointsCheckedSubject.asObservable();
	eventIterationSwitched$ = this._eventIterationSwitchedSubject.asObservable();
	eventFetchedPoints$ = this._eventFetchedPointsSubject.asObservable();
	eventUpdatedPoint$ = this._eventUpdatedPointSubject.asObservable();
	eventHasEditablePoints$ = this._eventHasEditablePointsSubject.asObservable();
	eventIntervalSwitched$ = this._eventIntervalSwitchedSubject.asObservable();
	eventAutocompleteOpened$ = this._eventAutocompleteOpenedSubject.asObservable();
	eventShortLinkChecked$ = this._eventShortLinkCheckedSubject.asObservable();
	eventOnboardingClosed$ = this._eventOnboardingClosedSubject.asObservable();
	eventIterationsChecked$ = this._eventIterationsCheckedSubject.asObservable();

	pointsChecked: string[] = [];

	get checkedPoints() {
		return this.pointsChecked;
	}

	getCheckedPoints(el: Element) {
		if (el?.children) {
			this.pointsChecked = Array.from(el?.children)
				.filter((item: any) => item?.querySelector('input')?.checked)
				.map((item: any) => item.getAttribute('data-id'));
		}
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

	pointUpdated(point: Point | undefined) {
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

	autocompleteOpened() {
		this._eventAutocompleteOpenedSubject.next();
	}

	shortLinkChecked() {
		this._eventShortLinkCheckedSubject.next();
	}

	iterationsChecked() {
		this._eventIterationsCheckedSubject.next();
	}

	onboardingClosed() {
		this._eventOnboardingClosedSubject.next();
	}
}
