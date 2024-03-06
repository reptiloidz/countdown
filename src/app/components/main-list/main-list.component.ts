import {
	ElementRef,
	ViewChild,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { Subscription, distinctUntilChanged, tap } from 'rxjs';
import {
	CalendarDate,
	CalendarMode,
	Iteration,
	Point,
} from 'src/app/interfaces';
import { DataService, ActionService } from 'src/app/services';

@Component({
	selector: 'app-main-list',
	templateUrl: './main-list.component.html',
})
export class MainListComponent implements OnInit, OnDestroy {
	@ViewChild('pointsList') private pointsList!: ElementRef;
	@ViewChild('datePointsList') private datePointsList!: ElementRef;
	points: Point[] = [];
	loading = true;
	dropOpenedDate: Date | undefined;
	isDatePointsChecked: boolean = false;
	datePointsChecked: string[] = [];
	isAllDatesChecked = false;
	private subscriptions = new Subscription();

	constructor(private data: DataService, private action: ActionService) {}

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
						this.action.pointsFetched();
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
		this.action.getCheckedPoints(this.pointsList.nativeElement);
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

	calendarRegenerated() {
		this.dropOpenedDate = undefined;
	}

	openDate({ date }: { date: CalendarDate; activeMode: CalendarMode }) {
		if (this.dropOpenedDate && +this.dropOpenedDate === +date.date) {
			this.dropOpenedDate = undefined;
		} else {
			this.dropOpenedDate = date.date;
		}

		this.isDatePointsChecked = false;
	}

	getCheckedDatePoints() {
		this.datePointsChecked = Array.from(
			this.datePointsList.nativeElement.children
		)
			.filter((item: any) => item?.querySelector('input')?.checked)
			.map((item: any) => item.getAttribute('data-id'));

		this.isDatePointsChecked = !!this.datePointsChecked.length;
	}

	checkDatePoints(check?: boolean) {
		Array.from(this.datePointsList.nativeElement.children).map(
			(item: any) =>
				item?.querySelector('input') &&
				(item.querySelector('input').checked = check)
		);
		this.getCheckedDatePoints();
	}

	removeDateCheckedPoints() {
		this.data.removePoints({
			list: this.datePointsChecked,
		});
	}
}
