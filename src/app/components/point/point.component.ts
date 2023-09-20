import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription, switchMap } from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { DataService } from 'src/app/services/data.service';
import {
	formatDistanceToNow,
	formatDuration,
	intervalToDuration,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { DateText } from 'src/app/enums/index';
import { getPointDate } from 'src/app/helpers';

@Component({
	selector: 'app-point',
	templateUrl: './point.component.html',
})
export class PointComponent implements OnInit, OnDestroy {
	point!: Point | undefined;
	pointDate = new Date();
	remainText = '';
	dateTimer = '';
	timer = '0:00:00';
	loading = false;
	tzOffset = this.pointDate.getTimezoneOffset();

	private subscriptions: Subscription = new Subscription();

	constructor(private data: DataService, private route: ActivatedRoute) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.route.params
				.pipe(
					switchMap((data: any) => {
						return this.data.fetchPoint(data['id']);
					})
				)
				.pipe(
					switchMap((point: Point | undefined) => {
						this.point = point;
						this.setAllTimers();
						return interval(1000);
					})
				)
				.subscribe({
					next: () => {
						this.setAllTimers();
					},
					error: (err) => {
						console.error(
							'Ошибка при обновлении таймеров:\n',
							err.message
						);
					},
				})
		);

		this.subscriptions.add(
			this.data.eventStartEditPoint$.subscribe({
				next: () => {
					this.loading = true;
				},
				error: (err) => {
					console.error('Ошибка при сбросе таймера:\n', err.message);
				},
			})
		);

		this.subscriptions.add(
			this.data.eventEditPoint$.subscribe({
				next: (point) => {
					this.loading = this.data.loading = false;
					this.point = point;
				},
				error: (err) => {
					console.error(
						'Ошибка при обновлении события после сброса таймера:\n',
						err.message
					);
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	getInterval() {
		return intervalToDuration({
			start: this.pointDate,
			end: new Date(),
		});
	}

	zeroPad(num?: number) {
		return String(num).padStart(2, '0');
	}

	setAllTimers() {
		this.pointDate = getPointDate(
			new Date(this.point?.dates?.slice(-1)[0].date || ''),
			this.tzOffset,
			this.point?.greenwich
		);
		this.setTimer();
		this.setDateTimer();
		this.setRemainText();
	}

	setTimer() {
		const currentInterval = this.getInterval();
		this.timer = `${currentInterval.hours}:${this.zeroPad(
			currentInterval.minutes
		)}:${this.zeroPad(currentInterval.seconds)}`;
	}

	setDateTimer() {
		const currentInterval = this.getInterval();
		if (
			currentInterval.years ||
			currentInterval.months ||
			currentInterval.days
		) {
			this.dateTimer = formatDuration(
				{
					years: currentInterval.years,
					months: currentInterval.months,
					days: currentInterval.days,
				},
				{
					locale: ru,
				}
			);
		} else {
			this.dateTimer = '';
		}
	}

	setRemainText() {
		this.remainText =
			this.getRemainText() +
			' ' +
			formatDistanceToNow(this.pointDate, {
				locale: ru,
			});
	}

	getRemainText() {
		const isPast = this.pointDate < new Date();
		const isForward = this.point?.direction === 'forward';

		return isPast
			? isForward
				? DateText.forwardPast
				: DateText.backwardPast
			: isForward
			? DateText.forwardFuture
			: DateText.backwardFuture;
	}
}
