import { Injectable, computed, signal } from '@angular/core';
import { Point } from '../interfaces';

@Injectable({
	providedIn: 'root',
})
export class UiStore {
	readonly pointsChecked = signal<string[]>([]);
	readonly hasPointsChecked = computed(() => this.pointsChecked().length > 0);
	readonly updatedPoint = signal<Point | undefined>(undefined);
	readonly hasEditablePoints = signal(false);

	setPointsChecked(ids: string[]): void {
		this.pointsChecked.set(ids);
	}

	setUpdatedPoint(point: Point | undefined): void {
		this.updatedPoint.set(point);
	}

	setHasEditablePoints(has: boolean): void {
		this.hasEditablePoints.set(has);
	}
}
