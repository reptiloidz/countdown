import { animate, style, transition, trigger } from '@angular/animations';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostBinding,
	HostListener,
	inject,
	OnInit,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PopupService } from 'src/app/services';
import { ButtonComponent } from '../button/button.component';

@Component({
	selector: 'app-popup',
	standalone: true,
	imports: [CommonModule, ButtonComponent],
	templateUrl: './popup.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('popup', [
			transition(':enter', [
				style({
					opacity: 0,
					transform: 'translateY(-10px)',
				}),
				animate(
					'.2s',
					style({
						opacity: 1,
						transform: 'translateY(0)',
					}),
				),
			]),
			transition(':leave', [
				style({
					opacity: 1,
					transform: 'translateY(0)',
				}),
				animate(
					'.2s',
					style({
						opacity: 0,
						transform: 'translateY(-10px)',
					}),
				),
			]),
		]),
	],
})
export class PopupComponent implements OnInit {
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly popupService = inject(PopupService);

	@ViewChild('popupContent', {
		read: ViewContainerRef,
	})
	popupContent!: ViewContainerRef;
	@HostBinding('role') role = 'dialog';

	title = '';
	isVisible = false;
	private subscriptions = new Subscription();

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

	show(title: string, component: unknown, inputs?: Record<string, unknown>) {
		this.isVisible = true;
		this.title = title;
		this.cdr.detectChanges();

		const componentRef = this.popupContent.createComponent(component as never);

		if (inputs) {
			for (const [key, value] of Object.entries(inputs)) {
				(componentRef.instance as Record<string, unknown>)[key] = value;
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
