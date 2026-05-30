import { Injectable, signal } from '@angular/core';
import { Point } from '../interfaces';

@Injectable({
	providedIn: 'root',
})
export class PointsStore {
	readonly points = signal<Point[]>([]);
	readonly loading = signal(false);

	setPoints(points: Point[]): void {
		this.points.set(points);
	}

	setLoading(loading: boolean): void {
		this.loading.set(loading);
	}

	addPoint(point: Point): void {
		if (this.points().some(item => item.id === point.id)) {
			return;
		}
		this.points.update(points => [...points, point]);
	}

	putPoint(point: Point): void {
		if (!this.points().some(item => item.id === point.id)) {
			this.addPoint(point);
		}
	}

	updatePoint(updatedPoint: Point): void {
		const index = this.points().findIndex(item => item.id === updatedPoint.id);
		if (index === -1) {
			return;
		}
		this.points.update(points => {
			const next = [...points];
			next[index] = updatedPoint;
			return next;
		});
	}

	removePoint(id: string | undefined): void {
		if (!id) {
			return;
		}
		this.points.update(points => points.filter(point => point.id !== id));
	}
}
