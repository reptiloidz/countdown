import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
	selector: 'app-main-list',
	templateUrl: './main-list.component.html',
})
export class MainListComponent implements OnInit, OnDestroy {
	points: Point[] = [];
	loading = true;
	private subscriptions: Subscription = new Subscription();

	constructor(private data: DataService) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.data.eventFetchAllPoints$
				.pipe(distinctUntilChanged())
				.subscribe({
					next: (points: Point[]) => {
						this.points = points;
						this.loading = false;
					},
				})
		);

		this.subscriptions.add(
			this.data.eventRemovePoint$.subscribe((id) => {
				this.points = this.points.filter((point) => point.id !== id);
			})
		);

		this.data.fetchAllPoints();
		this.loading = true;
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
