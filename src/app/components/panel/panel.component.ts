import {
	AUTO_STYLE,
	animate,
	state,
	style,
	transition,
	trigger,
} from '@angular/animations';
import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	ElementRef,
	EventEmitter,
	HostBinding,
	Input,
	Output,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { timer } from 'rxjs';
import { ButtonSize } from 'src/app/types';

@Component({
	selector: 'app-panel',
	templateUrl: './panel.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('panelContent', [
			state(
				'open',
				style({
					height: AUTO_STYLE,
					visibility: AUTO_STYLE,
				})
			),
			state(
				'closed',
				style({
					height: '0',
					visibility: 'hidden',
				})
			),
			transition(
				'open <=> closed',
				animate('.6s cubic-bezier(.1, .79, .24, .95)')
			),
		]),
	],
})
export class PanelComponent {
	@HostBinding('class') get dropClass() {
		return ['panel'].join(' ');
	}

	@ContentChild('buttonTemplate') buttonTemplate:
		| TemplateRef<unknown>
		| undefined;
	@ContentChild('bodyTemplate') bodyTemplate:
		| TemplateRef<unknown>
		| undefined;
	@ContentChild('extraTemplate') extraTemplate:
		| TemplateRef<unknown>
		| undefined;
	@ViewChild('panelContentRef') private panelContentRef!: ElementRef;

	@Input() open = false;
	@Input() icon: string = 'chevron-down';
	@Input() buttonSize!: ButtonSize;
	@Input() buttonClass = '';
	@Input() buttonTitle: string | null = null;
	@Output() panelVisibilitySwitched = new EventEmitter<boolean>();

	hasFirstUpdateHappened = false;

	updateHeight() {
		requestAnimationFrame(() => {
			const el = this.panelContentRef.nativeElement as HTMLElement;
			if (!this.hasFirstUpdateHappened) {
				this.hasFirstUpdateHappened = true;
				const newHeight = el.scrollHeight + 'px';
				el.setAttribute('data-height', newHeight);
				return;
			}

			el.classList.add('panel__content--animating');
			const prevHeight = el.getAttribute('data-height') || 'auto';
			el.style.height = 'auto';
			const newHeight = el.scrollHeight + 'px';
			el.style.height = prevHeight;

			requestAnimationFrame(() => {
				el.style.height = newHeight;
				el.setAttribute('data-height', newHeight);

				timer(600).subscribe(() => {
					el.classList.remove('panel__content--animating');
					el.removeAttribute('style');
				});
			});
		});
	}

	openHandler() {
		this.open = true;
	}

	closeHandler() {
		this.open = false;
	}

	toggleHandler() {
		if (this.open) {
			this.closeHandler();
		} else {
			this.openHandler();
		}

		this.panelVisibilitySwitched.emit(this.open);
	}
}
