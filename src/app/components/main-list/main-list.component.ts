import {
	ElementRef,
	ViewChild,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { Subscription, distinctUntilChanged, tap } from 'rxjs';
import { SortTypeNames } from 'src/app/enums';
import { CalendarDate, CalendarMode, Point } from 'src/app/interfaces';
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
	dropOpenSort = false;
	isDatePointsChecked: boolean = false;
	datePointsChecked: string[] = [];
	isAllDatesChecked = false;
	sortType = SortTypeNames.titleAsc;
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
						this.sortPoints();
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

	get sortTypeNames() {
		return SortTypeNames;
	}

	get sortTypeNamesArray() {
		return Object.values(SortTypeNames);
	}

	checkPoint() {
		this.action.getCheckedPoints(this.pointsList.nativeElement);
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

	compareTitle(a: Point, b: Point) {
		if (a.title > b.title) {
			return 1;
		} else if (a.title < b.title) {
			return -1;
		} else {
			return 0;
		}
	}

	// compareUser(a: Point, b: Point) {
	// TODO: доделать, когда будем хранить имя юзера
	// 	if (a.title > b.title) {
	// 		return 1;
	// 	} else if (a.title < b.title) {
	// 		return -1;
	// 	} else {
	// 		return this.compareTitle(a, b);
	// 	}
	// }

	compareRepeatable(a: Point, b: Point) {
		if (!a.repeatable && b.repeatable) {
			return 1;
		} else if (a.repeatable && !b.repeatable) {
			return -1;
		} else {
			return this.compareTitle(a, b);
		}
	}

	compareGreenwich(a: Point, b: Point) {
		if (!a.greenwich && b.greenwich) {
			return 1;
		} else if (a.greenwich && !b.greenwich) {
			return -1;
		} else {
			return this.compareTitle(a, b);
		}
	}

	comparePublic(a: Point, b: Point) {
		if (!a.public && b.public) {
			return 1;
		} else if (a.public && !b.public) {
			return -1;
		} else {
			return this.compareTitle(a, b);
		}
	}

	sortPoints(points = this.points, sortType?: SortTypeNames) {
		this.sortType = sortType
			? (sortType as SortTypeNames)
			: (this.sortType as SortTypeNames);

		this.dropOpenSort = false;

		return points.sort((a, b) => {
			switch (this.sortType) {
				case SortTypeNames.titleAsc:
					return this.compareTitle(a, b);
				case SortTypeNames.titleDesc:
					return this.compareTitle(b, a);
				// case SortTypeNames.userAsc:
				// 	return this.compareUser(a, b);
				// case SortTypeNames.userDesc:
				// 	return this.compareUser(b, a);
				case SortTypeNames.repeatableAsc:
					return this.compareRepeatable(b, a);
				case SortTypeNames.repeatableDesc:
					return this.compareRepeatable(a, b);
				case SortTypeNames.greenwichAsc:
					return this.compareGreenwich(b, a);
				case SortTypeNames.greenwichDesc:
					return this.compareGreenwich(a, b);
				case SortTypeNames.publicAsc:
					return this.comparePublic(b, a);
				case SortTypeNames.publicDesc:
					return this.comparePublic(a, b);
				default:
					return 0;
			}
		});
	}

	sortPointsClick(sort: SortTypeNames) {
		this.sortPoints(this.points, sort);
	}

	openSort() {
		this.dropOpenSort = !this.dropOpenSort;
	}
}
