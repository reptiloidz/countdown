import { Component, HostBinding, Input } from '@angular/core';
import { NgClassType } from 'src/app/types';

@Component({
	selector: 'app-loader',
	templateUrl: './loader.component.html',
})
export class LoaderComponent {
	@HostBinding('class') get componentClass(): string | null {
		const baseClass = 'loader';
		return [baseClass].filter((_) => _).join(' ');
	}

	@Input() iconClass: NgClassType;
}
