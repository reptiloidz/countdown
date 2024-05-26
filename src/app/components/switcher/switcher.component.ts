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
	@Output() valueSwitched = new EventEmitter<string>();
	@HostBinding('class') get componentClass(): string | null {
		const baseClass = 'switcher';
		const modeClass = this.mode && `${baseClass}--${this.mode}`;
		return [baseClass, modeClass].filter((_) => _).join(' ');
	}

	switchMode(event: Event) {
		this.valueSwitched.emit((event.target as HTMLInputElement).value);
	}
}
