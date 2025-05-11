import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostBinding,
	HostListener,
	OnInit,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { PopupService } from 'src/app/services';

@Component({
	selector: 'app-popup',
	templateUrl: './popup.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupComponent implements OnInit {
	@ViewChild('popupContent', {
		read: ViewContainerRef,
	})
	popupContent!: ViewContainerRef;
	@HostBinding('role') role = 'dialog';

	title = '';
	isVisible = false;
	private subscriptions = new Subscription();

	constructor(
		private cdr: ChangeDetectorRef,
		private popupService: PopupService,
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.popupService.eventPopupOpen$.subscribe({
				next: data => {
					this.show(data.title, data.component, data.inputs);
				},
			}),
		);

		this.subscriptions.add(
			this.popupService.eventPopupClose$.subscribe({
				next: () => {
					this.close();
				},
			}),
		);
	}

	show(title: string, component: any, inputs?: Record<string, any>) {
		this.isVisible = true;
		this.title = title;
		this.cdr.detectChanges();

		const componentRef = this.popupContent.createComponent(component);

		if (inputs) {
			for (const [key, value] of Object.entries(inputs)) {
				(componentRef.instance as any)[key] = value;
			}
		}

		this.cdr.markForCheck();
	}

	close() {
		this.isVisible = false;
		this.popupContent?.clear();
		this.popupService.hide();
		this.cdr.detectChanges();
	}

	@HostListener('document:keydown.escape')
	onEscapeKeydown() {
		if (this.isVisible) {
			this.close();
		}
	}
}
