import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { DataService } from 'src/app/services/data.service';
import { formatDistanceToNow } from 'date-fns';
import { DateText } from 'src/app/enums/date-text.enum';

@Component({
	selector: 'app-point',
	templateUrl: './point.component.html',
})
export class PointComponent implements OnInit, OnDestroy {
	point!: Point | undefined;
	resultText = '';

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
						this.resultText =
							this.getResultText() +
							' ' +
							formatDistanceToNow(new Date(point?.date || ''));
					},
				})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	getResultText() {
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
