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
import { Point, SwitcherItem } from 'src/app/interfaces';
import { DataService, ActionService, AuthService } from 'src/app/services';
import { SortService } from 'src/app/services/sort.service';
import {
	Direction,
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
	isDatePointsChecked: boolean = false;
	datePointsChecked: string[] = [];
	isAllDatesChecked = false;
	sortType: SortTypes = 'titleAsc';
	colorType: PointColorTypes[] = [];
	repeatableValue: FilterSelected = 'all';
	greenwichValue: FilterSelected = 'all';
	publicValue: FilterSelected = 'all';
	directionValue: Direction | 'all' = 'all';
	modesValue: 'list' | 'grid' = 'grid';
	searchInputValue = '';

	repeatList: SwitcherItem[] = [
		{
			text: 'Однократные',
			value: 'false',
			icon: 'redo',
		},
		{
			text: 'Однократные/повторяемые',
			value: 'all',
			icon: 'minus',
		},
		{
			text: 'Повторяемые',
			value: 'true',
			icon: 'refresh',
		},
	];

	greenwichList: SwitcherItem[] = [
		{
			text: 'По местному времени',
			value: 'false',
			icon: 'home',
		},
		{
			text: 'По местному/по Гринвичу',
			value: 'all',
			icon: 'minus',
		},
		{
			text: 'По Гринвичу',
			value: 'true',
			icon: 'globe',
		},
	];

	publicList: SwitcherItem[] = [
		{
			text: 'Приватные',
			value: 'false',
			icon: 'lock',
		},
		{
			text: 'Приватные/публичные',
			value: 'all',
			icon: 'minus',
		},
		{
			text: 'Публичные',
			value: 'true',
			icon: 'users',
		},
	];

	directionList: SwitcherItem[] = [
		{
			text: 'Обратный',
			value: 'backward',
			icon: 'rotate-left',
		},
		{
			text: 'Обратный/прямой',
			value: 'all',
			icon: 'minus',
		},
		{
			text: 'Прямой',
			value: 'forward',
			icon: 'rotate-right',
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

					if (data.direction) {
						this.directionValue = data.direction;
					} else {
						this.directionValue = 'all';
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
					localStorage.setItem('directionValue', this.directionValue);
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
		this.changeModes();
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
			this.directionValue !== 'all' ||
			this.searchInputValue !== '' ||
			this.colorType.length
		);
	}

	get colorTypeString() {
		return this.colorType.join('+');
	}

	get isAuth() {
		return this.auth.isAuthenticated;
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

	changeDirectionFilter(value: string) {
		this.directionValue = value as Direction | 'all';
		this.changeFilters();
	}

	changeFilters() {
		this.searchInputValue = this.searchInput.value.toString();
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
				direction:
					this.directionValue === 'all' ? null : this.directionValue,
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
		this.directionValue = 'all';
		this.searchInput.value = '';
		this.resetColors();
		this.changeFilters();
	}

	changeModes(value?: string) {
		this.modesValue =
			((value || localStorage.getItem('modesValue')) as
				| 'list'
				| 'grid') || 'grid';
		value && localStorage.setItem('modesValue', value);
	}

	checkPoint() {
		this.action.getCheckedPoints(this.pointsList.nativeElement);
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
		// Делаем отложенное срабатывание пересчёта "чекнутых" событий,
		// чтобы кнопка-триггер не исчезла раньше времени и дроп не закрылся
		setTimeout(() => {
			Array.from(this.datePointsList.nativeElement.children).map(
				(item: any) =>
					item?.querySelector('input:not(:disabled)') &&
					(item.querySelector('input:not(:disabled)').checked = check)
			);
			this.getCheckedDatePoints();
		});
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

	resetColors() {
		if (this.colorList) {
			Array.from(this.colorList.nativeElement.children).map(
				(item: any) =>
					item?.querySelector('input') &&
					(item.querySelector('input').checked = false)
			);
			this.changeFilters();
		} else {
			this.colorType = [];
		}
	}
}
