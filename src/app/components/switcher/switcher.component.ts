import {
	Component,
	EventEmitter,
	HostBinding,
	Input,
	Output,
} from '@angular/core';
import { SwitcherItem } from 'src/app/interfaces';

@Component({
	selector: 'app-switcher',
	templateUrl: './switcher.component.html',
})
export class SwitcherComponent {
	@Input() items: SwitcherItem[] = [];
	@Input() value!: string;
	@Output() valueSwitched = new EventEmitter<string>();
	@HostBinding('class') class = 'switcher';

	switchMode(event: Event) {
		this.valueSwitched.emit((event.target as HTMLInputElement).value);
	}
}
