import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActionService } from 'src/app/services';

@Component({
	selector: 'app-no-page',
	templateUrl: './no-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoPageComponent implements OnInit, OnDestroy {
	@HostBinding('class') class = 'no-page';
	private subscriptions = new Subscription();
	loading = true;

	constructor(
		private action: ActionService,
		private cdr: ChangeDetectorRef,
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.action._eventShortLinkChecked$.subscribe({
				next: () => {
					this.loading = false;
					this.cdr.detectChanges();
				},
				error: () => {
					this.loading = false;
					this.cdr.detectChanges();
				},
				complete: () => {
					this.loading = false;
					this.cdr.detectChanges();
				},
			}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
