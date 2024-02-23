import {
	ElementRef,
	ViewChild,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { Subscription, distinctUntilChanged, tap } from 'rxjs';
import { CalendarMode, Iteration, Point } from 'src/app/interfaces';
import { DataService } from 'src/app/services';

@Component({
	selector: 'app-main-list',
	templateUrl: './main-list.component.html',
})
export class MainListComponent implements OnInit, OnDestroy {
	@ViewChild('pointsList') private pointsList!: ElementRef;
	points: Point[] = [];
	loading = true;
	private subscriptions = new Subscription();

	constructor(private data: DataService) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.data.eventFetchAllPoints$
				.pipe(
					tap(() => {
						this.loading = false;
					})
				)
				.pipe(distinctUntilChanged())
				.subscribe({
					next: (points: Point[]) => {
						this.points = points;
					},
					error(err) {
						console.error(
							'Ошибка при загрузке списка:',
							err.message
						);
					},
				})
		);

		this.subscriptions.add(
			this.data.eventRemovePoint$.subscribe({
				next: (id) => {
					this.points = this.points.filter(
						(point) => point.id !== id
					);
				},
			})
		);

		this.data.fetchAllPoints();
		this.loading = true;
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	checkPoint() {
		this.data.getCheckedPoints(this.pointsList.nativeElement);
	}

	dateSelected({
		date,
		mode,
		data,
	}: {
		date: Date;
		mode: CalendarMode;
		data: Point[] | Iteration[];
	}) {
		console.log(date, mode, data);
	}

	dateChecked({
		data,
		check,
	}: {
		data: Point[] | Iteration[];
		check: boolean;
	}) {
		console.log(data, check);
	}
}
