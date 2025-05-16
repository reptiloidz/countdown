import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, Event, ActivatedRoute, NavigationEnd } from '@angular/router';
import { format, formatISO } from 'date-fns';
import { filter, Subscription, mergeMap, combineLatestWith, of, distinctUntilChanged, take } from 'rxjs';
import { getPointFromUrl, parseDate } from 'src/app/helpers';
import { Point } from 'src/app/interfaces';
import { AuthService, DataService, ActionService, NotifyService, HttpService } from 'src/app/services';
import { HttpParams } from '@angular/common/http';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Constants } from 'src/app/enums';

@Component({
	selector: '[app-footer]',
	templateUrl: './footer.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent implements OnInit, OnDestroy {
	pointId: string | undefined;
	point: Point | undefined;
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
	link = signal('');
	isLinkGenerating = false;
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
		private cdr: ChangeDetectorRef,
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

	get pointsRemovingLength() {
		return this.action.checkedPoints.length;
	}

	get location() {
		return window.location.origin + '/';
	}

	ngOnInit(): void {
		this.subscriptions.add(
			this.router.events
				.pipe(
					filter((event: Event) => event instanceof NavigationEnd),
					combineLatestWith(this.route.queryParams),
					distinctUntilChanged(),
					mergeMap(([event, queryParams]: [any, any]) => {
						this.link.set('');
						const finalPath = this.router.getCurrentNavigation()?.finalUrl?.root.children['primary']?.segments[0].path;
						this.iteration = queryParams.iteration;
						this.pointId =
							this.router.lastSuccessfulNavigation?.finalUrl?.root.children['primary']?.segments &&
							this.router.lastSuccessfulNavigation?.finalUrl?.root.children['primary']?.segments.length > 1
								? this.router.lastSuccessfulNavigation?.finalUrl?.root.children['primary']?.segments[1].path
								: undefined;
						this.isEdit = finalPath === 'edit';
						this.isCreate = finalPath === 'create';
						this.isCreateUrl = finalPath === 'create-url';
						this.isUrl = finalPath === 'url';
						this.isMain = !finalPath;
						this.isTimer = this.isUrl && !queryParams.date;

						if (this.isUrl && !this.link() && !this.isLinkGenerating) {
							this.isLinkGenerating = true;
							this.subscriptions.add(
								this.http
									.getShortLink(window.location.search.slice(1))
									.pipe(take(1))
									.subscribe({
										next: link => {
											if (!link) {
												this.http.postShortLink(window.location.search.slice(1)).subscribe({
													next: result => {
														this.link.set(result?.short);
														this.isLinkGenerating = false;
													},
												});
											} else {
												this.isLinkGenerating = false;
											}
										},
									}),
							);
						}

						return this.pointId
							? this.data.fetchPoint(this.pointId)
							: of(Object.keys(queryParams).length !== 0 ? getPointFromUrl(queryParams) : undefined);
					}),
				)
				.subscribe({
					next: (point: Point | undefined) => {
						this.point = point;
						const iterationNumber = this.iteration || 1;

						if (this.point?.dates && !this.isTimer && !this.isCreateUrl) {
							const googleLinkDate =
								point?.dates[iterationNumber - 1]?.date &&
								formatISO(parseDate(point?.dates[iterationNumber - 1]?.date, this.isTimer, this.isTimer), {
									format: 'basic',
								}) + (point?.greenwich ? 'Z' : '');

							const googleLinkParams = {
								text: point?.title ?? '',
								details: point?.description ?? '',
								dates: googleLinkDate ? googleLinkDate + '/' + googleLinkDate : '',
							};

							this.exportGoogleLink =
								'https://calendar.google.com/calendar/u/0/r/eventedit?' +
								new HttpParams({
									fromObject: googleLinkParams,
								}).toString();
							this.hasAccess = point && this.auth.checkAccessEdit(point);
						}
						this.cdr.markForCheck();
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
					this.cdr.markForCheck();
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
					this.cdr.markForCheck();
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
					this.cdr.markForCheck();
				},
			}),
		);

		this.subscriptions.add(
			this.action.eventHasEditablePoints$.subscribe({
				next: data => {
					this.hasEditablePoints = data;
					this.cdr.markForCheck();
				},
			}),
		);

		this.subscriptions.add(
			this.action.eventUpdatedPoint$.subscribe({
				next: point => {
					this.point = point;
					this.cdr.markForCheck();
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
		} else if (this.link()) {
			this.copyLink(this.link());
		} else {
			this.shareLinkLoading = true;
			this.http
				.getShortLink(window.location.search.slice(1))
				.pipe(take(1))
				.subscribe({
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
					title: this.point?.title ?? '',
					url: window.location.origin + '/' + link,
				})
				.catch(e => {
					console.error('Ошибка:' + e);
				})
				.finally(() => {
					this.shareLinkLoading = false;
					this.cdr.markForCheck();
				});
		} else {
			navigator.clipboard
				.writeText(window.location.origin + '/' + link)
				.then(() => {
					this.notify.add({
						title: 'URL события успешно скопирован в&nbsp;буфер обмена',
						text: window.location.origin + '/' + link,
						short: true,
						view: 'positive',
					});
				})
				.catch(() => {
					console.error('Надо вернуть фокус в браузер для копирования ссылки');
				})
				.finally(() => {
					this.shareLinkLoading = false;
					this.cdr.markForCheck();
				});
		}
	}

	copyPoint(toPoint = false) {
		const point = this.point;
		if (point) {
			point.dates = point?.dates.slice(-1);
			if (this.isTimer) {
				point.dates[0].date = format(parseDate(point.dates[0].date, true, true), Constants.fullDateFormat);
			}
			point.repeatable = false;
			point.public = false;
			point.greenwich = false;
		}

		this.router.navigate([toPoint ? '/create/' : '/create-url/']).then(() => {
			this.action.pointUpdated(point);
		});
	}
}
