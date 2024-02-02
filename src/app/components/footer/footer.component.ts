import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	Router,
	Event,
	ActivationStart,
	ActivatedRoute,
} from '@angular/router';
import { format } from 'date-fns';
import { filter, Subscription, switchMap, EMPTY, concatMap, tap } from 'rxjs';
import { Constants } from 'src/app/enums';
import { getPointDate } from 'src/app/helpers';
import { Iteration } from 'src/app/interfaces/iteration.interface';
import { Point } from 'src/app/interfaces/point.interface';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';

@Component({
	selector: '[app-footer]',
	templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit, OnDestroy {
	pointId!: string;
	point!: Point | undefined;
	isEdit = false;
	isCreate = false;
	isMain = false;
	hasAccess: boolean | undefined = false;
	pointsChecked: boolean = false;
	tzOffset = new Date().getTimezoneOffset();
	iteration = 0;
	private subscriptions = new Subscription();

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private data: DataService,
		private auth: AuthService
	) {}

	get isAuthenticated() {
		return this.auth.isAuthenticated;
	}

	get isVerified() {
		return this.auth.checkEmailVerified;
	}

	ngOnInit(): void {
		this.subscriptions.add(
			this.route.queryParams
				.pipe(
					tap((data: any) => {
						this.iteration = data.iteration;
					}),
					concatMap(() => this.router.events),
					filter((event: Event) => event instanceof ActivationStart)
				)
				.pipe(
					switchMap((data: any) => {
						this.pointId = data.snapshot.params['id'];
						this.isEdit = data.snapshot.url[0]?.path === 'edit';
						this.isCreate = data.snapshot.url[0]?.path === 'create';
						this.isMain = !data.snapshot.url.length;
						return this.pointId
							? this.data.fetchPoint(this.pointId)
							: EMPTY;
					})
				)
				.subscribe({
					next: (point: Point | undefined) => {
						this.point = point;
						this.hasAccess =
							point && this.auth.checkAccessEdit(point);
					},
					error: (err) => {
						console.error(
							'Ошибка в футере при получении события:\n',
							err.message
						);
					},
				})
		);

		this.subscriptions.add(
			this.data.eventEditPoint$.subscribe({
				next: (point) => {
					this.point = point;
				},
				error: (err) => {
					console.error(
						'Ошибка при обновлении итераций события:\n',
						err.message
					);
				},
			})
		);

		this.subscriptions.add(
			this.data.eventPointsChecked$.subscribe({
				next: (check) => {
					this.pointsChecked = check;
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	setDateNow() {
		let newDatesArray = this.point?.dates;
		const lastDate = {
			date: format(
				getPointDate({
					tzOffset: this.tzOffset,
					isGreenwich: this.point?.greenwich,
					isInvert: true,
				}),
				Constants.fullDateFormat
			),
			reason: 'byHand',
		} as Iteration;
		if (this.point?.repeatable) {
			newDatesArray && newDatesArray.push(lastDate);
		} else {
			newDatesArray && (newDatesArray = [lastDate]);
		}

		confirm('Обновить время события?') &&
			this.data.editPoint(this.point?.id, {
				...this.point,
				dates: newDatesArray,
			} as Point);
	}

	checkAllPoints() {
		this.data.checkAllPoints();
	}

	uncheckAllPoints() {
		this.data.uncheckAllPoints();
	}

	removeAllCheckedPoints() {
		this.data.removePoints();
	}
}
