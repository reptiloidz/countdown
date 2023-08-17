import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { DataService } from 'src/app/services/data.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
	selector: 'app-main-list',
	templateUrl: './main-list.component.html',
})
export class MainListComponent implements OnInit, OnDestroy {
	points: Point[] = [];
	private subscriptions: Subscription = new Subscription();

	constructor(private data: DataService, private http: HttpService) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.data.fetchAllPoints().subscribe({
				next: (points: Point[]) => {
					this.points = points;
					this.data.points = points;
				},
			})
		);

		this.subscriptions.add(
			this.data.eventRemovePoint$.subscribe((id) => {
				this.points = this.points.filter((point) => point.id !== id);
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
