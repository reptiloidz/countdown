import {
	ChangeDetectorRef,
	Component,
	HostBinding,
	Input,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { Subscription, switchMap } from 'rxjs';
import { Point } from 'src/app/interfaces';
import { DataService, PopupService } from 'src/app/services';
import { SortTypes } from 'src/app/types';

@Component({
	selector: 'app-date-points-popup',
	templateUrl: './date-points-popup.component.html',
})
export class DatePointsPopupComponent implements OnInit, OnDestroy {
	@HostBinding('class') class = 'date-points-popup';

	@Input() pointsList: Point[] = [];
	@Input() sortType!: SortTypes;
	@Input() footerRef!: TemplateRef<unknown>;
	@Input() listRef!: TemplateRef<unknown>;
	@ViewChild('containerRef', { read: ViewContainerRef, static: true })
	containerRef!: ViewContainerRef;

	private subscriptions = new Subscription();

	constructor(
		private data: DataService,
		private popupService: PopupService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.data.eventRemovePoint$
				.pipe(switchMap(() => this.data.eventFetchAllPoints$))
				.subscribe({
					next: (points: Point[]) => {
						this.pointsList = this.pointsList.filter((point) =>
							points.some((item) => item.id === point.id)
						);

						this.cdr.detectChanges();

						if (!this.pointsList.length) {
							this.popupService.close();
						}
					},
				})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
