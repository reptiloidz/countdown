import {
	ElementRef,
	ViewChild,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, distinctUntilChanged, tap } from 'rxjs';
import { PointColors, SortTypeNames } from 'src/app/enums';
import { CalendarDate, Point } from 'src/app/interfaces';
import { DataService, ActionService, AuthService } from 'src/app/services';
import {
	CalendarMode,
	FilterSelected,
	PointColorTypes,
	SortTypes,
} from 'src/app/types';

@Component({
	selector: 'app-main-list',
	templateUrl: './main-list.component.html',
})
export class MainListComponent implements OnInit, OnDestroy {
	@ViewChild('pointsList') private pointsList!: ElementRef;
	@ViewChild('datePointsList') private datePointsList!: ElementRef;
	@ViewChild('repeatableSelect') private repeatableSelect!: ElementRef;
	@ViewChild('greenwichSelect') private greenwichSelect!: ElementRef;
	@ViewChild('publicSelect') private publicSelect!: ElementRef;
	@ViewChild('searchInput') private searchInput!: ElementRef;
	@ViewChild('colorList') private colorList!: ElementRef;
	points: Point[] = [];
	loading = true;
	dropOpenedDate: Date | undefined;
	dropOpenSort = false;
	dropOpenColors = false;
	isDatePointsChecked: boolean = false;
	datePointsChecked: string[] = [];
	isAllDatesChecked = false;
	sortType: SortTypes = 'titleAsc';
	colorType: PointColorTypes[] = [];
	repeatableSelectValue: FilterSelected = 'all';
	greenwichSelectValue: FilterSelected = 'all';
	publicSelectValue: FilterSelected = 'all';
	searchInputValue = '';

	private subscriptions = new Subscription();

	constructor(
		private data: DataService,
		private action: ActionService,
		private router: Router,
		private route: ActivatedRoute,
		private auth: AuthService
	) {}

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
						this.sortPoints({
							points: this.points,
							navigate: false,
						});
						this.action.pointsFetched();
						this.action.hasEditablePoints(
							this.points.some((point) =>
								this.auth.checkAccessEdit(point)
							)
						);
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

		this.subscriptions.add(
			this.route.queryParams.subscribe({
				next: (data: any) => {
					this.searchInputValue = data.search || '';
					data.sort && (this.sortType = data.sort);

					if (data.repeat) {
						this.repeatableSelectValue = data.repeat;
					} else {
						this.repeatableSelectValue = 'all';
					}

					if (data.greenwich) {
						this.greenwichSelectValue = data.greenwich;
					} else {
						this.greenwichSelectValue = 'all';
					}

					if (data.public) {
						this.publicSelectValue = data.public;
					} else {
						this.publicSelectValue = 'all';
					}

					if (data.color) {
						this.colorType = data.color.split('+');
					} else {
						this.colorType = [];
					}

					localStorage.setItem(
						'searchInputValue',
						this.searchInputValue
					);
					localStorage.setItem('sort', this.sortType);
					localStorage.setItem(
						'repeatableSelectValue',
						this.repeatableSelectValue
					);
					localStorage.setItem(
						'greenwichSelectValue',
						this.greenwichSelectValue
					);
					localStorage.setItem(
						'publicSelectValue',
						this.publicSelectValue
					);
					localStorage.setItem(
						'colorValue',
						this.colorType.join('+') || 'all'
					);
				},
				error: (err) => {
					console.error(
						'Ошибка при получении параметров:\n',
						err.message
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

	get sortTypeKeysArray() {
		return Object.keys(SortTypeNames) as SortTypes[];
	}

	get pointColorNames() {
		return PointColors;
	}

	get pointColors() {
		return Object.keys(PointColors) as PointColorTypes[];
	}

	get filtersFilled() {
		return (
			this.repeatableSelectValue !== 'all' ||
			this.greenwichSelectValue !== 'all' ||
			this.publicSelectValue !== 'all' ||
			this.searchInputValue !== '' ||
			this.colorType !== undefined
		);
	}

	changeFilters() {
		this.repeatableSelectValue = this.repeatableSelect?.nativeElement.value;
		this.greenwichSelectValue = this.greenwichSelect?.nativeElement.value;
		this.publicSelectValue = this.publicSelect?.nativeElement.value;
		this.searchInputValue = this.searchInput?.nativeElement.value;

		this.colorType = this.colorList
			? Array.from(this.colorList.nativeElement.children)
					.filter(
						(item: any) => item?.querySelector('input')?.checked
					)
					.map((item: any) => item.getAttribute('data-color'))
			: [];

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				repeat:
					this.repeatableSelectValue === 'all'
						? null
						: this.repeatableSelectValue,
				greenwich:
					this.greenwichSelectValue === 'all'
						? null
						: this.greenwichSelectValue,
				public:
					this.publicSelectValue === 'all'
						? null
						: this.publicSelectValue,
				search: this.searchInputValue || null,
				color: this.colorType.join('+') || null,
			},
			queryParamsHandling: 'merge',
		});
	}

	clearFilters() {
		(this.repeatableSelect?.nativeElement as HTMLInputElement).value =
			'all';
		(this.greenwichSelect?.nativeElement as HTMLInputElement).value = 'all';
		(this.publicSelect?.nativeElement as HTMLInputElement).value = 'all';
		(this.searchInput?.nativeElement as HTMLInputElement).value = '';
		this.resetColors();
		this.changeFilters();
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
		this.dropOpenSort = false;
		this.dropOpenColors = false;
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

	sortPoints(
		{
			points,
			sortType,
			navigate = true,
		}: {
			points: Point[];
			sortType?: SortTypes;
			navigate?: boolean;
		} = { points: this.points }
	) {
		this.sortType = sortType ? sortType : this.sortType;

		this.dropOpenSort = false;

		navigate &&
			this.router.navigate([], {
				relativeTo: this.route,
				queryParams: {
					sort: this.sortType !== 'titleAsc' ? this.sortType : null,
				},
				queryParamsHandling: 'merge',
			});

		return points.sort((a, b) => {
			switch (this.sortType) {
				case 'titleAsc':
					return this.compareTitle(a, b);
				case 'titleDesc':
					return this.compareTitle(b, a);
				// case SortTypeNames.userAsc:
				// 	return this.compareUser(a, b);
				// case SortTypeNames.userDesc:
				// 	return this.compareUser(b, a);
				case 'repeatableAsc':
					return this.compareRepeatable(b, a);
				case 'repeatableDesc':
					return this.compareRepeatable(a, b);
				case 'greenwichAsc':
					return this.compareGreenwich(b, a);
				case 'greenwichDesc':
					return this.compareGreenwich(a, b);
				case 'publicAsc':
					return this.comparePublic(b, a);
				case 'publicDesc':
					return this.comparePublic(a, b);
				default:
					return 0;
			}
		});
	}

	sortPointsClick(sort: SortTypes) {
		this.sortPoints({
			points: this.points,
			sortType: sort,
		});
	}

	openSort() {
		this.dropOpenSort = !this.dropOpenSort;
		this.dropOpenedDate = undefined;
		this.dropOpenColors = false;
	}

	resetColors() {
		if (this.colorList) {
			Array.from(this.colorList.nativeElement.children).map(
				(item: any) =>
					item?.querySelector('input') &&
					(item.querySelector('input').checked = false)
			);
		} else {
			this.colorType = [];
		}
	}

	openColors() {
		this.dropOpenColors = !this.dropOpenColors;
		this.dropOpenedDate = undefined;
		this.dropOpenSort = false;
	}

	hasEditablePoints(points: Point[]) {
		return points.some((point) => this.auth.checkAccessEdit(point));
	}
}
