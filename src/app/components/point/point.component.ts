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
import { DateText } from 'src/app/enums/date-text.enum';
import { HttpService } from 'src/app/services/http.service';

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

	constructor(
		private data: DataService,
		private http: HttpService,
		private route: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.route.params
				.pipe(
					switchMap((data: any) => {
						return this.data.getPointData(data['id']);
					})
				)
				.subscribe({
					next: (point: Point | undefined) => {
						// this.http.addPoint(point);
						this.point = point;
						this.setRemainText(point);
					},
				})
		);

		this.subscriptions.add(
			interval(1000).subscribe({
				next: () => {
					this.setTimer();
					this.setDateTimer();
					this.setRemainText(this.point);
				},
			})
		);

		this.subscriptions.add(
			this.data.eventEditPoint$.subscribe((point) => {
				this.point = point;
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

	zeroPad(num?: number) {
		return String(num).padStart(2, '0');
	}

	setTimer() {
		const currentInterval = this.getInterval(
			new Date(this.point?.date || '')
		);
		this.timer = `${currentInterval.hours}:${this.zeroPad(
			currentInterval.minutes
		)}:${this.zeroPad(currentInterval.seconds)}`;
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
		} else {
			this.dateTimer = '';
		}
	}

	setRemainText(point: Point | undefined) {
		this.remainText =
			this.getRemainText() +
			' ' +
			formatDistanceToNow(new Date(point?.date || ''), {
				locale: ru,
			});
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
