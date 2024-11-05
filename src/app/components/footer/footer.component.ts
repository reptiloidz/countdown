import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	Router,
	Event,
	ActivationStart,
	ActivatedRoute,
} from '@angular/router';
import { format, formatISO } from 'date-fns';
import { filter, Subscription, EMPTY, mergeMap, combineLatestWith } from 'rxjs';
import { Constants } from 'src/app/enums';
import { getPointDate, parseDate } from 'src/app/helpers';
import { Iteration, Point } from 'src/app/interfaces';
import {
	AuthService,
	DataService,
	ActionService,
	NotifyService,
} from 'src/app/services';
import { HttpParams } from '@angular/common/http';

@Component({
	selector: '[app-footer]',
	templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit, OnDestroy {
	pointId!: string;
	point!: Point | undefined;
	isEdit = false;
	isCreate = false;
	isCreateUrl = false;
	isMain = false;
	hasAccess: boolean | undefined = false;
	pointsChecked: boolean = false;
	iteration = 0;
	exportGoogleLink = '';
	hasEditablePoints = false;
	private subscriptions = new Subscription();

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private data: DataService,
		private action: ActionService,
		private auth: AuthService,
		private notify: NotifyService
	) {}

	get isAuthenticated() {
		return this.auth.isAuthenticated;
	}

	get isVerified() {
		return this.auth.checkEmailVerified;
	}

	ngOnInit(): void {
		this.subscriptions.add(
			this.router.events
				.pipe(
					filter((event: Event) => event instanceof ActivationStart),
					combineLatestWith(this.route.queryParams),
					mergeMap(([event, queryParams]: [any, any]) => {
						this.iteration = queryParams.iteration;
						this.pointId = event.snapshot.params['id'];
						this.isEdit = event.snapshot.url[0]?.path === 'edit';
						this.isCreate =
							event.snapshot.url[0]?.path === 'create';
						this.isCreateUrl =
							event.snapshot.url[0]?.path === 'create-url';
						this.isMain = !event.snapshot.url.length;
						return this.pointId
							? this.data.fetchPoint(this.pointId)
							: EMPTY;
					})
				)
				.subscribe({
					next: (point: Point | undefined) => {
						this.point = point;

						if (this.iteration) {
							const googleLinkDate =
								point?.dates[this.iteration - 1]?.date &&
								formatISO(
									parseDate(
										point?.dates[this.iteration - 1]?.date
									),
									{ format: 'basic' }
								) + (point?.greenwich ? 'Z' : '');

							const googleLinkParams = {
								text: point?.title || '',
								details: point?.description || '',
								dates: googleLinkDate
									? googleLinkDate + '/' + googleLinkDate
									: '',
							};

							this.exportGoogleLink =
								'https://calendar.google.com/calendar/u/0/r/eventedit?' +
								new HttpParams({
									fromObject: googleLinkParams,
								}).toString();
						}
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
				next: ([point]) => {
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
			this.data.eventRemovePoint$.subscribe({
				next: () => {
					this.router.navigate(['']);
					this.notify.add({
						title: `Событие удалено`,
						type: 'positive',
						short: true,
					});
				},
				error: (err) => {
					console.error(
						'Ошибка при удалении события:\n',
						err.message
					);
				},
			})
		);

		this.subscriptions.add(
			this.action.eventPointsChecked$.subscribe({
				next: (check) => {
					this.pointsChecked = check;
				},
			})
		);

		this.subscriptions.add(
			this.action.eventHasEditablePoints$.subscribe({
				next: (data) => (this.hasEditablePoints = data),
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	setDateNow() {
		this.notify
			.confirm({
				title: 'Обновить время события?',
			})
			.subscribe({
				next: () => {
					let newDatesArray = this.point?.dates;
					const lastDate = {
						date: format(
							getPointDate({
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
					this.data.editPoint(this.point?.id, {
						...this.point,
						dates: newDatesArray,
					} as Point);
				},
			});
	}

	checkAllPoints() {
		this.action.checkAllPoints();
	}

	uncheckAllPoints() {
		this.action.uncheckAllPoints();
	}

	removeAllCheckedPoints() {
		this.data.removePoints();
	}

	removePoint() {
		this.data.removePoints({
			id: this.point?.id,
		});
	}
}
