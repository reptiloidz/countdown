import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnDestroy,
	OnInit,
	ViewChild,
	ElementRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';

@Component({
	selector: '[app-main-item]',
	templateUrl: './main-item.component.html',
})
export class MainItemComponent implements OnInit, OnDestroy {
	@ViewChild('pointCheckbox') private pointCheckbox!: ElementRef;

	private subscriptions = new Subscription();
	@Input() point!: Point;
	@Output() pointCheck = new EventEmitter();
	loading = false;

	constructor(private data: DataService, private auth: AuthService) {}

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

		this.subscriptions.add(
			this.data.eventPointsChecked$.subscribe({
				next: (check) => {
					this.pointCheckbox &&
						(this.pointCheckbox.nativeElement.checked = check);
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	checkAccessEdit(point: Point) {
		return this.auth.checkAccessEdit(point);
	}

	delete(id: string | undefined) {
		confirm('Удалить событие?') && this.data.removePoint(id);
	}

	checkPoint() {
		this.pointCheck.emit();
	}
}
