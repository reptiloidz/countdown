import {
	Component,
	Input,
	Output,
	EventEmitter,
	OnDestroy,
	OnInit,
	ViewChild,
	ContentChild,
	TemplateRef,
} from '@angular/core';
import { Subscription, first } from 'rxjs';
import { Point, UserExtraData } from 'src/app/interfaces';
import { ActionService, AuthService, DataService } from 'src/app/services';
import { CheckboxComponent } from '../checkbox/checkbox.component';

@Component({
	selector: '[app-main-item]',
	templateUrl: './main-item.component.html',
})
export class MainItemComponent implements OnInit, OnDestroy {
	@ViewChild('pointCheckbox') private pointCheckbox!: CheckboxComponent;

	private subscriptions = new Subscription();
	@Input() point!: Point;
	@Input() isCard = false;
	@Output() pointCheck = new EventEmitter();

	@ContentChild('checkboxTemplate') checkboxTemplate:
		| TemplateRef<unknown>
		| undefined;
	loading = false;

	constructor(
		private data: DataService,
		private auth: AuthService,
		private action: ActionService
	) {}

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
			})
		);

		this.subscriptions.add(
			this.action.eventPointsCheckedAll$.subscribe({
				next: (check) => {
					this.pointCheckbox &&
						(this.pointCheckbox.isChecked = check);
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	delete(id: string | undefined) {
		this.data.removePoints({ id });
	}

	checkPoint() {
		this.pointCheck.emit();
	}

	loadUserInfo(id?: string) {
		if (id && !this.point.userInfo) {
			this.auth
				.getUserData(id)
				.pipe(first())
				.subscribe({
					next: (userData: UserExtraData) => {
						this.point.userInfo = userData;
					},
				});
		}
	}
}
