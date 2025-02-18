import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, Event, ActivationStart, ActivatedRoute } from '@angular/router';
import { formatISO } from 'date-fns';
import { filter, Subscription, mergeMap, combineLatestWith, of } from 'rxjs';
import { getPointFromUrl, parseDate } from 'src/app/helpers';
import { Point } from 'src/app/interfaces';
import { AuthService, DataService, ActionService, NotifyService, HttpService } from 'src/app/services';
import { HttpParams } from '@angular/common/http';
import { DeviceDetectorService } from 'ngx-device-detector';

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
	isUrl = false;
	isTimer = false;
	isMain = false;
	hasAccess: boolean | undefined = false;
	pointsChecked = false;
	iteration = 0;
	exportGoogleLink = '';
	hasEditablePoints = false;
	shareLinkLoading = false;
	private subscriptions = new Subscription();

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private data: DataService,
		private action: ActionService,
		private auth: AuthService,
		private notify: NotifyService,
		private http: HttpService,
		private deviceService: DeviceDetectorService,
	) {}

	get isAuthenticated() {
		return this.auth.isAuthenticated;
	}

	get isVerified() {
		return this.auth.checkEmailVerified;
	}

	get isPublicPoint(): boolean {
		return this.point?.public || false;
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
						this.isCreate = event.snapshot.url[0]?.path === 'create';
						this.isCreateUrl = event.snapshot.url[0]?.path === 'create-url';
						this.isUrl = event.snapshot.url[0]?.path === 'url';
						this.isMain = !event.snapshot.url.length;
						this.isTimer = this.isUrl && !event.snapshot.queryParams.date;
						return this.pointId
							? this.data.fetchPoint(this.pointId)
							: of(
									Object.keys(event.snapshot.queryParams).length !== 0
										? getPointFromUrl(event.snapshot.queryParams)
										: undefined,
								);
					}),
				)
				.subscribe({
					next: (point: Point | undefined) => {
						this.point = point;
						const iterationNumber = this.iteration || 1;

						if (this.point && this.point.dates) {
							const googleLinkDate =
								point?.dates[iterationNumber - 1]?.date &&
								formatISO(parseDate(point?.dates[iterationNumber - 1]?.date, this.isTimer, this.isTimer), {
									format: 'basic',
								}) + (point?.greenwich ? 'Z' : '');

							const googleLinkParams = {
								text: point?.title || '',
								details: point?.description || '',
								dates: googleLinkDate ? googleLinkDate + '/' + googleLinkDate : '',
							};

							this.exportGoogleLink =
								'https://calendar.google.com/calendar/u/0/r/eventedit?' +
								new HttpParams({
									fromObject: googleLinkParams,
								}).toString();
							this.hasAccess = point && this.auth.checkAccessEdit(point);
						}
					},
					error: err => {
						console.error('Ошибка в футере при получении события:\n', err.message);
					},
				}),
		);

		this.subscriptions.add(
			this.data.eventEditPoint$.subscribe({
				next: ([point]) => {
					this.point = point;
				},
				error: err => {
					console.error('Ошибка при обновлении итераций события:\n', err.message);
				},
			}),
		);

		this.subscriptions.add(
			this.data.eventRemovePoint$.subscribe({
				next: () => {
					!this.isMain && this.router.navigate(['']);
					this.notify.add({
						title: `Событие удалено`,
						view: 'positive',
						short: true,
					});
				},
				error: err => {
					console.error('Ошибка при удалении события:\n', err.message);
				},
			}),
		);

		this.subscriptions.add(
			this.action.eventPointsChecked$.subscribe({
				next: check => {
					this.pointsChecked = check;
				},
			}),
		);

		this.subscriptions.add(
			this.action.eventHasEditablePoints$.subscribe({
				next: data => (this.hasEditablePoints = data),
			}),
		);

		this.subscriptions.add(
			this.action.eventUpdatedPoint$.subscribe({
				next: point => {
					this.point = point;
				},
			}),
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
					this.point && this.data.setDateNow(this.point);
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

	share() {
		if (this.pointId) {
			this.copyLink(this.pointId);
		} else {
			this.shareLinkLoading = true;
			this.http.getShortLink(window.location.search.slice(1)).subscribe({
				next: link => {
					if (link) {
						this.copyLink(link);
					} else {
						this.http.postShortLink(window.location.search.slice(1)).subscribe({
							next: result => {
								this.copyLink(result.short);
							},
						});
					}
				},
			});
		}
	}

	copyLink(link: string) {
		if (this.pointId) {
			link = 'point/' + link;
		}

		if (this.deviceService.isMobile() && !!navigator.canShare) {
			navigator
				.share({
					title: window.location.origin + '/' + link,
				})
				.catch(e => {
					this.notify.add({
						title: 'Ошибка при шэринге ссылки',
						text: e,
						short: true,
						view: 'negative',
					});
					console.error('Ошибка:' + e);
				});
		} else {
			navigator.clipboard
				.writeText(window.location.origin + '/' + link)
				.then(() => {
					this.notify.add({
						title: 'URL события успешно скопирован в буфер обмена',
						text: window.location.origin + '/' + link,
						short: true,
						view: 'positive',
					});
					this.shareLinkLoading = false;
				})
				.catch(() => {
					console.error('Надо вернуть фокус в браузер для копирования ссылки');
					this.shareLinkLoading = false;
				});
		}
	}

	copyPoint(toPoint = false) {
		const point = this.point;
		if (point) {
			point.dates = point?.dates.slice(-1);
			point.repeatable = false;
			point.public = false;
			point.greenwich = false;
		}

		this.router.navigate([toPoint ? '/create/' : '/create-url/']).then(() => {
			this.action.pointUpdated(point);
		});
	}
}
