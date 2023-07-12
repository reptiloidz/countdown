import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { DataService } from 'src/app/services/data.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
	selector: 'app-point',
	templateUrl: './point.component.html',
})
export class PointComponent implements OnInit, OnDestroy {
	point!: Point | undefined;
	private subscriptions: Subscription = new Subscription();

	constructor(
		private data: DataService,
		private route: ActivatedRoute,
		private http: HttpService
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.route.params
				.pipe(
					switchMap((data) => {
						return this.fetchPoint(data['id']);
					})
				)
				.subscribe({
					next: (point) => {
						this.data.addPoint(point);
						this.point = point;
					},
				})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	fetchPoint(id: string): Observable<Point | undefined> {
		if (!this.data.points.find((item) => item.id === id)) {
			return this.http.getPoint(id);
		}
		return of(this.data.points.find((item) => item.id === id));
	}
}
