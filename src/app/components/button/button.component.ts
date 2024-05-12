import { Component, ElementRef, HostBinding, Input } from '@angular/core';

@Component({
	selector: '[app-button]',
	templateUrl: './button.component.html',
})
export class ButtonComponent {
	@Input() icon!: string;
	@Input() type!: string;
	@Input() loading = false;
	@Input() view: 'button' | 'link' = 'button';
	@Input() mode!: 'primary' | 'negative' | 'positive';
	@Input() size!: 'sm' | 'lg';

	@HostBinding('attr.type') get typeAttr(): string | null {
		return (
			this.type ||
			(this.elementRef.nativeElement.nodeName?.toLowerCase() === 'button'
				? 'button'
				: null)
		);
	}
	@HostBinding('class') get componentClass(): string | null {
		const baseClass = this.view === 'button' ? 'button' : 'link';
		const modeClass = this.mode && `${baseClass}--${this.mode}`;
		const sizeClass = this.size && `${baseClass}--${this.size}`;
		return [baseClass, modeClass, sizeClass].filter((_) => _).join(' ');
	}

	constructor(public elementRef: ElementRef) {}
}
