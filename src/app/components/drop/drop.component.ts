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

	@Input() opened = false;

	value = '';

	open() {
		this.opened = this.opened ? false : true;
	}

	close() {
		this.opened = false;
	}
}
