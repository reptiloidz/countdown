import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClockComponent } from 'src/app/components/clock/clock.component';
import { ActionService } from 'src/app/services';

@Component({
	selector: 'app-no-page',
	standalone: true,
	imports: [CommonModule, RouterModule, ClockComponent],
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
			this.action.eventShortLinkChecked$.subscribe({
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
