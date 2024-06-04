import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	EventEmitter,
	HostBinding,
	Input,
	Output,
	TemplateRef,
} from '@angular/core';
import { ButtonSize } from 'src/app/types';

@Component({
	selector: 'app-panel',
	templateUrl: './panel.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent {
	@HostBinding('class') get dropClass() {
		return ['panel', this.open ? 'panel--open' : ''].join(' ');
	}

	@ContentChild('buttonTemplate') buttonTemplate:
		| TemplateRef<unknown>
		| undefined;
	@ContentChild('bodyTemplate') bodyTemplate:
		| TemplateRef<unknown>
		| undefined;

	@Input() open = false;
	@Input() icon: string = 'chevron-down';
	@Input() buttonSize!: ButtonSize;
	@Input() buttonClass = '';
	@Input() buttonTitle: string | null = null;
	@Output() panelVisibilitySwitched = new EventEmitter<boolean>();

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
