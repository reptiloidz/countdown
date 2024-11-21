import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActionService } from 'src/app/services';

@Component({
	selector: 'app-no-page',
	templateUrl: './no-page.component.html',
})
export class NoPageComponent implements OnInit, OnDestroy {
	@HostBinding('class') class = 'no-page';
	private subscriptions = new Subscription();
	loading = true;

	constructor(private action: ActionService) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.action._eventShortLinkChecked$.subscribe({
				next: () => {
					this.loading = false;
				},
				error: () => {
					this.loading = false;
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
