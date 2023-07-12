import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { Point } from 'src/app/interfaces/point.interface';
import { DataService } from 'src/app/services/data.service';

export enum EditPointType {
	Create = 'create',
	Edit = 'edit',
}

@Component({
	selector: 'app-edit-point',
	templateUrl: './edit-point.component.html',
})
export class EditPointComponent implements OnInit, OnDestroy {
	@Input() type = EditPointType.Edit;
	form!: FormGroup;
	point: Point | undefined;
	private subscriptions: Subscription = new Subscription();

	constructor(
		private data: DataService,
		private route: ActivatedRoute,
		private router: Router
	) {}

	ngOnInit(): void {
		this.form = new FormGroup({
			title: new FormControl(null, [Validators.required]),
			description: new FormControl(null, [Validators.required]),
			time: new FormControl(null, [Validators.required]),
		});

		this.subscriptions.add(
			this.route.params
				.pipe(
					switchMap((data) => {
						return this.data.fetchPoint(data['id']);
					})
				)
				.subscribe({
					next: (point) => {
						if (!this.isCreation) {
							this.point = point;
							this.setValues();
						}
					},
				})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get isCreation() {
		return this.type === EditPointType.Create;
	}

	setValues() {
		this.form.controls['title'].setValue(this.point?.title);
		this.form.controls['description'].setValue(this.point?.description);
		this.form.controls['time'].setValue(this.point?.time);
	}

	submit() {
		if (this.isCreation) {
			this.point = {
				...this.form.value,
				id: new Date().getTime().toString(),
			};
			this.data.addPoint(this.point);
			this.router.navigate(['/edit/' + this.point?.id.toString()]);
		} else {
			this.data.editPoint(this.point?.id, this.form.value as Point);
		}
		alert('Успешно');
	}
}
