import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { addMinutes, format, subMinutes } from 'date-fns';
import { filter, Subscription, switchMap, EMPTY } from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
	selector: '[app-footer]',
	templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit, OnDestroy {
	pointId!: string;
	point!: Point | undefined;
	isEdit = false;
	tzOffset = new Date().getTimezoneOffset();
	private subscriptions: Subscription = new Subscription();

	constructor(private router: Router, private data: DataService) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.router.events
				.pipe(filter((event: Event) => event instanceof NavigationEnd))
				.pipe(
					switchMap(() => {
						// Не удалось получить snapshot прямо из события, проблема с типами (либо any, либо никак)
						const snapshot =
							this.router.routerState.snapshot.root.firstChild;
						this.pointId = snapshot?.params['id'];
						this.isEdit = snapshot?.url[0]?.path === 'edit';
						return this.pointId
							? this.data.fetchPoint(this.pointId)
							: EMPTY;
					})
				)
				.subscribe({
					next: (point: Point | undefined) => {
						this.point = point;
					},
					error: (err) => {
						console.error(
							'Ошибка в футере при получении события:\n',
							err.message
						);
					},
				})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	getPointDate(
		pointDate = new Date(this.point?.date || ''),
		isInvert = false
	) {
		if (
			this.point?.greenwich &&
			(this.tzOffset > 0 || (this.tzOffset < 0 && isInvert))
		) {
			pointDate = addMinutes(pointDate, this.tzOffset);
		} else if (
			this.point?.greenwich &&
			(this.tzOffset < 0 || (this.tzOffset > 0 && isInvert))
		) {
			pointDate = subMinutes(pointDate, this.tzOffset);
		}
		return pointDate;
	}

	setDateNow() {
		confirm('Обновить время события?') &&
			this.data.editPoint(this.point?.id, {
				...this.point,
				date: format(
					this.getPointDate(new Date(), true),
					'MM/dd/yyyy HH:mm'
				),
			} as Point);
	}
}
