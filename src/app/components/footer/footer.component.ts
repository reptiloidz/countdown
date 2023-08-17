import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { format } from 'date-fns';
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
							? this.data.getPointData(this.pointId)
							: EMPTY;
					})
				)
				.subscribe({
					next: (point: Point | undefined) => {
						this.point = point;
					},
					error(err) {
						console.log('Ошибка в Футере:', err);
					},
				})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	setDateNow() {
		confirm('Обновить время события?') &&
			this.data.editPointData(this.point?.id, {
				...this.point,
				date: format(new Date(), 'MM.dd.yyyy HH:mm'),
			} as Point);
	}
}
