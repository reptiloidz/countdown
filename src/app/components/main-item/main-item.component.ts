import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
	selector: '[app-main-item]',
	templateUrl: './main-item.component.html',
})
export class MainItemComponent implements OnInit, OnDestroy {
	constructor(private data: DataService) {}

	private subscriptions: Subscription = new Subscription();
	@Input() point!: Point;
	loading = false;

	ngOnInit(): void {
		this.subscriptions.add(
			this.data.eventStartRemovePoint$.subscribe({
				next: (id) => {
					if (this.point.id === id) {
						this.loading = true;
					}
				},
				error: (err) => {
					console.error(
						'Ошибка при удалении события:\n',
						err.message
					);
				},
			})
		);

		this.subscriptions.add(
			this.data.eventRemovePoint$.subscribe({
				next: () => {
					this.loading = this.data.loading = false;
				},
				error: (err) => {
					console.error(
						'Ошибка при удалении события:\n',
						err.message
					);
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	delete(id: string | undefined) {
		confirm('Удалить событие?') && this.data.removePoint(id);
	}
}
