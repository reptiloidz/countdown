import { Component, ElementRef, HostBinding, Input } from '@angular/core';

@Component({
	selector: '[app-button]',
	templateUrl: './button.component.html',
})
export class ButtonComponent {
	@Input() icon!: string;
	@Input() iconTitle!: string;
	@Input() iconAriaHidden: 'true' | 'false' = 'true';
	@Input() type!: string;
	@Input() loading = false;
	@Input() view: 'button' | 'link' = 'button';
	@Input() mode!: 'primary' | 'negative' | 'positive' | 'ghost';
	@Input() size!: 'sm' | 'lg';
	@Input() disabled = false;

	@HostBinding('attr.type') get typeAttr(): string | null {
		return this.type || (this.tag === 'button' ? 'button' : null);
	}
	@HostBinding('class') get componentClass(): string | null {
		const baseClass = this.view === 'button' ? 'button' : 'link';
		const modeClass = this.mode && `${baseClass}--${this.mode}`;
		const sizeClass = this.size && `${baseClass}--${this.size}`;
		const disabledClass =
			this.disabled && this.tag === 'a' && `${baseClass}--disabled`;
		return [baseClass, modeClass, sizeClass, disabledClass]
			.filter((_) => _)
			.join(' ');
	}

	get tag(): string {
		return this.elementRef.nativeElement.nodeName?.toLowerCase();
	}

	constructor(public elementRef: ElementRef) {}
}
