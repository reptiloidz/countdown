import { Component, OnInit } from '@angular/core';
import { ActivationEnd, Router, Event } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
	selector: '[app-footer]',
	templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
	pointId!: string;
	private subscriptions: Subscription = new Subscription();

	constructor(private router: Router) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.router.events
				.pipe(filter((event: Event) => event instanceof ActivationEnd))
				.subscribe(() => {
					this.pointId =
						this.router.routerState.snapshot.root.firstChild?.params[
							'id'
						];
				})
		);
	}
}
