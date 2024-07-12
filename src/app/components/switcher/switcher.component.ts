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
	@Input() mode: 'ghost' = 'ghost';
	@Input() showTitle = false;
	@Input() switcherListClass = '';
	@Output() valueSwitched = new EventEmitter<string>();
	@HostBinding('class') get componentClass(): string | null {
		const baseClass = 'switcher';
		const modeClass = this.mode && `${baseClass}--${this.mode}`;
		return [baseClass, modeClass].filter((_) => _).join(' ');
	}

	get valueName() {
		return this.items.find((item) => item.value === this.value)?.text;
	}

	switchMode(event: Event) {
		this.valueSwitched.emit((event.target as HTMLInputElement).value);
	}
}
