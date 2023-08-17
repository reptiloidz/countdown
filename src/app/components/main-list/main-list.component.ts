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
	result: Point[] = [];
	private subscriptions: Subscription = new Subscription();

	constructor(private data: DataService, private http: HttpService) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.data.getPointsData().subscribe({
				next: (result: Point[]) => {
					this.result = result;
					this.data.points = result;
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
