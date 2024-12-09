import { Component, ElementRef, HostBinding, Input } from '@angular/core';
import { ButtonSize } from 'src/app/types';

@Component({
	selector: '[app-button]',
	templateUrl: './button.component.html',
})
export class ButtonComponent {
	@Input() icon!: string;
	@Input() iconTitle!: string;
	@Input() iconPosition: 'left' | 'right' = 'left';
	@Input() iconAriaHidden: 'true' | 'false' = 'true';
	@Input() type!: string;
	@Input() loading = false;
	@Input() view: 'button' | 'link' = 'button';
	@Input() mode!:
		| 'primary'
		| 'secondary'
		| 'negative'
		| 'positive'
		| 'ghost'
		| 'ghost-positive';
	@Input() size!: ButtonSize;
	@Input() disabled = false;
	@Input() textClass: string[] = [];

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

	get textClasses() {
		return [
			this.view === 'button' ? 'button__text' : 'link__text',
			...this.textClass,
		];
	}

	constructor(public elementRef: ElementRef) {}
}
