import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Point } from '../interfaces';
import { UiStore } from '../state/ui.store';

@Injectable({
	providedIn: 'root',
})
export class ActionService {
	private _eventPointsCheckedAllSubject = new Subject<boolean>();
	private _eventPointsCheckedSubject = new Subject<boolean>();
	private _eventIterationSwitchedSubject = new Subject<Date>();
	private _eventFetchedPointsSubject = new Subject<void>();
	private _eventUpdatedPointSubject = new Subject<Point | undefined>();
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

	/** Только один onboarding-тултип может быть активен одновременно */
	private activeOnboardingId: string | null = null;

	constructor(private uiStore: UiStore) {}

	tryActivateOnboarding(id: string): boolean {
		if (this.activeOnboardingId !== null && this.activeOnboardingId !== id) {
			return false;
		}
		this.activeOnboardingId = id;
		return true;
	}

	deactivateOnboarding(id: string): void {
		if (this.activeOnboardingId === id) {
			this.activeOnboardingId = null;
		}
	}

	get checkedPoints(): string[] {
		return this.uiStore.pointsChecked();
	}

	get pointsChecked(): string[] {
		return this.uiStore.pointsChecked();
	}

	set pointsChecked(ids: string[]) {
		this.uiStore.setPointsChecked(ids);
	}

	getCheckedPoints(el: Element) {
		if (el?.children) {
			const ids = Array.from(el.children)
				.filter((item: Element) => (item as HTMLElement).querySelector('input')?.checked)
				.map(item => item.getAttribute('data-id'))
				.filter((id): id is string => !!id);
			this.uiStore.setPointsChecked(ids);
		}
		this._eventPointsCheckedSubject.next(this.uiStore.hasPointsChecked());
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
		this.uiStore.setUpdatedPoint(point);
		this._eventUpdatedPointSubject.next(point);
	}

	hasEditablePoints(has: boolean) {
		this.uiStore.setHasEditablePoints(has);
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
