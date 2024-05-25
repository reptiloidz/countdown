import {
	ElementRef,
	ViewChild,
	Component,
	OnDestroy,
	OnInit,
	HostBinding,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, distinctUntilChanged, tap } from 'rxjs';
import { PointColors, SortTypeNames } from 'src/app/enums';
import { CalendarDate, Point, SwitcherItem } from 'src/app/interfaces';
import { DataService, ActionService, AuthService } from 'src/app/services';
import { SortService } from 'src/app/services/sort.service';
import {
	CalendarMode,
	FilterSelected,
	PointColorTypes,
	SortTypes,
} from 'src/app/types';
import { InputComponent } from '../input/input.component';

@Component({
	selector: 'app-main-list',
	templateUrl: './main-list.component.html',
})
export class MainListComponent implements OnInit, OnDestroy {
	@ViewChild('pointsList') private pointsList!: ElementRef;
	@ViewChild('datePointsList') private datePointsList!: ElementRef;
	@ViewChild('searchInput') private searchInput!: InputComponent;
	@ViewChild('colorList') private colorList!: ElementRef;
	@HostBinding('class') class = 'main__inner';
	points: Point[] = [];
	loading = true;
	dropOpenDate: Date | undefined;
	dropOpenSort = false;
	dropOpenColors = false;
	isDatePointsChecked: boolean = false;
	datePointsChecked: string[] = [];
	isAllDatesChecked = false;
	sortType: SortTypes = 'titleAsc';
	colorType: PointColorTypes[] = [];
	repeatableValue: FilterSelected = 'all';
	greenwichValue: FilterSelected = 'all';
	publicValue: FilterSelected = 'all';
	modesValue: 'list' | 'grid' = 'grid';
	searchInputValue = '';
	calendarOpen = false;

	repeatList: SwitcherItem[] = [
		{
			text: 'Неповторяемые',
			value: 'false',
			boolean: false,
		},
		{
			text: 'Повторяемость',
			value: 'all',
			icon: 'refresh',
		},
		{
			text: 'Повторяемые',
			value: 'true',
			boolean: true,
		},
	];

	greenwichList: SwitcherItem[] = [
		{
			text: 'По местному времени',
			value: 'false',
			boolean: false,
		},
		{
			text: 'Часовой пояс',
			value: 'all',
			icon: 'globe',
		},
		{
			text: 'По Гринвичу',
			value: 'true',
			boolean: true,
		},
	];

	publicList: SwitcherItem[] = [
		{
			text: 'Приватные',
			value: 'false',
			boolean: false,
		},
		{
			text: 'Публичность',
			value: 'all',
			icon: 'users',
		},
		{
			text: 'Публичные',
			value: 'true',
			boolean: true,
		},
	];

	modesList: SwitcherItem[] = [
		{
			text: 'Список',
			value: 'list',
			icon: 'lines',
		},
		{
			text: 'Сетка',
			value: 'grid',
			icon: 'piles',
		},
	];

	private subscriptions = new Subscription();

	constructor(
		private data: DataService,
		private action: ActionService,
		private router: Router,
		private route: ActivatedRoute,
		private auth: AuthService,
		private sort: SortService
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
						this.repeatableValue = data.repeat;
					} else {
						this.repeatableValue = 'all';
					}

					if (data.greenwich) {
						this.greenwichValue = data.greenwich;
					} else {
						this.greenwichValue = 'all';
					}

					if (data.public) {
						this.publicValue = data.public;
					} else {
						this.publicValue = 'all';
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
						'repeatableValue',
						this.repeatableValue
					);
					localStorage.setItem('greenwichValue', this.greenwichValue);
					localStorage.setItem('publicValue', this.publicValue);
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
			this.repeatableValue !== 'all' ||
			this.greenwichValue !== 'all' ||
			this.publicValue !== 'all' ||
			this.searchInputValue !== '' ||
			this.colorType.length
		);
	}

	get colorTypeString() {
		return this.colorType.join('+');
	}

	changeRepeatFilter(value: string) {
		this.repeatableValue = value as FilterSelected;
		this.changeFilters();
	}

	changeGreenwichFilter(value: string) {
		this.greenwichValue = value as FilterSelected;
		this.changeFilters();
	}

	changePublicFilter(value: string) {
		this.publicValue = value as FilterSelected;
		this.changeFilters();
	}

	changeFilters() {
		this.searchInputValue = this.searchInput.value;
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
					this.repeatableValue === 'all'
						? null
						: this.repeatableValue,
				greenwich:
					this.greenwichValue === 'all' ? null : this.greenwichValue,
				public: this.publicValue === 'all' ? null : this.publicValue,
				search: this.searchInputValue || null,
				color: this.colorType.join('+') || null,
			},
			queryParamsHandling: 'merge',
		});
	}

	clearFilters() {
		this.repeatableValue = 'all';
		this.greenwichValue = 'all';
		this.publicValue = 'all';
		this.searchInput.value = '';
		this.resetColors();
		this.changeFilters();
	}

	changeModes(value: string) {
		this.modesValue = value as 'list' | 'grid';
	}

	checkPoint() {
		this.action.getCheckedPoints(this.pointsList.nativeElement);
	}

	calendarRegenerated() {
		this.dropOpenDate = undefined;
	}

	openDate({ date }: { date: CalendarDate; activeMode: CalendarMode }) {
		if (this.dropOpenDate && +this.dropOpenDate === +date.date) {
			this.dropOpenDate = undefined;
		} else {
			this.dropOpenDate = date.date;
		}

		this.isDatePointsChecked = false;
		this.dropOpenSort = false;
		this.dropOpenColors = false;
	}

	toggleCalendarVisibility() {
		this.calendarOpen = !this.calendarOpen;
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

		return this.sort.sort(points, this.sortType);
	}

	sortPointsClick(sort: SortTypes) {
		this.sortPoints({
			points: this.points,
			sortType: sort,
		});
	}

	openSort() {
		this.dropOpenSort = !this.dropOpenSort;
		this.dropOpenDate = undefined;
		this.dropOpenColors = false;
	}

	resetColors() {
		if (this.colorList) {
			Array.from(this.colorList.nativeElement.children).map(
				(item: any) =>
					item?.querySelector('input') &&
					(item.querySelector('input').checked = false)
			);
			this.changeFilters();
			this.dropOpenColors = false;
		} else {
			this.colorType = [];
		}
	}

	openColors() {
		this.dropOpenColors = !this.dropOpenColors;
		this.dropOpenDate = undefined;
		this.dropOpenSort = false;
	}
}
