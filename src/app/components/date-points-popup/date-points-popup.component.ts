import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostBinding,
	inject,
	Input,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivationStart, Event, Router } from '@angular/router';
import { filter, Subscription, switchMap } from 'rxjs';
import { Point } from 'src/app/interfaces';
import { DataService, PopupService } from 'src/app/services';
import { SortTypes } from 'src/app/types';
import { CheckEditablePointsPipe } from 'src/app/pipes/check-editable-points.pipe';

@Component({
	selector: 'app-date-points-popup',
	standalone: true,
	imports: [CommonModule, CheckEditablePointsPipe],
	templateUrl: './date-points-popup.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePointsPopupComponent implements OnInit, OnDestroy {
	private readonly data = inject(DataService);
	private readonly popupService = inject(PopupService);
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly router = inject(Router);

	@HostBinding('class') class = 'date-points-popup';

	@Input() pointsList: Point[] = [];
	@Input() sortType!: SortTypes;
	@Input() footerRef!: TemplateRef<unknown>;
	@Input() listRef!: TemplateRef<unknown>;
	@ViewChild('containerRef', { read: ViewContainerRef, static: true })
	containerRef!: ViewContainerRef;

	private subscriptions = new Subscription();

	ngOnInit(): void {
		this.subscriptions.add(
			this.data.eventRemovePoint$.pipe(switchMap(() => this.data.eventFetchAllPoints$)).subscribe({
				next: (points: Point[]) => {
					this.pointsList = this.pointsList.filter(point => points.some(item => item.id === point.id));

					this.cdr.markForCheck();

					if (!this.pointsList.length) {
						this.popupService.close();
					}
				},
			}),
		);

		this.subscriptions.add(
			this.router.events.pipe(filter((event: Event) => event instanceof ActivationStart)).subscribe({
				next: () => {
					this.popupService.close();
				},
			}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
