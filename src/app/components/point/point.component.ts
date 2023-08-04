import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription, switchMap } from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { DataService } from 'src/app/services/data.service';
import {
	format,
	formatDistanceToNow,
	formatDuration,
	intervalToDuration,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { DateText } from 'src/app/enums/date-text.enum';

@Component({
	selector: 'app-point',
	templateUrl: './point.component.html',
})
export class PointComponent implements OnInit, OnDestroy {
	point!: Point | undefined;
	remainText = '';
	dateTimer = '';
	timer = '';

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
				.subscribe({
					next: (point: Point | undefined) => {
						this.data.addPoint(point);
						this.point = point;
						this.remainText =
							this.getRemainText() +
							' ' +
							formatDistanceToNow(new Date(point?.date || ''), {
								locale: ru,
							});
					},
				})
		);

		this.subscriptions.add(
			interval(1000).subscribe({
				next: () => {
					this.setTimer();
					this.setDateTimer();
				},
			})
		);
		this.setTimer();
		this.setDateTimer();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	getInterval(date: Date) {
		return intervalToDuration({
			start: date,
			end: new Date(),
		});
	}

	setTimer() {
		const currentInterval = this.getInterval(
			new Date(this.point?.date || '')
		);
		this.timer = `${currentInterval.hours}:${currentInterval.minutes}:${currentInterval.seconds}`;
	}

	setDateTimer() {
		const currentInterval = this.getInterval(
			new Date(this.point?.date || '')
		);
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
		}
	}

	getRemainText() {
		const isPast = new Date(this.point?.date || '') < new Date();
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
