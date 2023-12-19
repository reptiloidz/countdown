import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, Event, ActivationEnd } from '@angular/router';
import { format } from 'date-fns';
import { filter, Subscription, switchMap, EMPTY } from 'rxjs';
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
	hasAccess: boolean | undefined = false;
	tzOffset = new Date().getTimezoneOffset();
	private subscriptions = new Subscription();

	constructor(
		private router: Router,
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
			this.router.events
				.pipe(filter((event: Event) => event instanceof ActivationEnd))
				.pipe(
					switchMap((data: any) => {
						this.pointId = data.snapshot.params['id'];
						this.isEdit = data.snapshot.url[0]?.path === 'edit';
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
}
