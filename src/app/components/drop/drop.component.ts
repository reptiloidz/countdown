import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	HostBinding,
	Input,
	TemplateRef,
} from '@angular/core';

@Component({
	selector: 'app-drop',
	templateUrl: './drop.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropComponent {
	@HostBinding('class') class = 'drop';

	@ContentChild('buttonTemplate') buttonTemplate:
		| TemplateRef<unknown>
		| undefined;
	@ContentChild('bodyTemplate') bodyTemplate:
		| TemplateRef<unknown>
		| undefined;

	@Input() open = false;
	@Input() dropBodyClass: string | string[] | null = null;

	value = '';

	openHandler() {
		this.open = this.open ? false : true;
	}

	closeHandler() {
		this.open = false;
	}
}
