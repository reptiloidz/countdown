import {
	AUTO_STYLE,
	animate,
	state,
	style,
	transition,
	trigger,
} from '@angular/animations';
import {
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
	@HostBinding('attr.data-open') get dataOpen() {
		return this.open;
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
	@ContentChild('extraButton') extraButton: TemplateRef<unknown> | undefined;
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
			const newHeight = el.scrollHeight + 'px';

			if (!this.hasFirstUpdateHappened) {
				this.hasFirstUpdateHappened = true;
				el.setAttribute('data-height', newHeight);
				return;
			}

			el.classList.add('panel__content--animating');
			el.style.height = el.getAttribute('data-height') || 'auto';

			requestAnimationFrame(() => {
				el.style.height = newHeight;
				el.setAttribute('data-height', newHeight);

				timer(300).subscribe(() => {
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
