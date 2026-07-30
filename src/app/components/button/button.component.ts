import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonSize } from 'src/app/types';
import { LoaderComponent } from '../loader/loader.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
	selector: '[app-button]',
	standalone: true,
	imports: [CommonModule, LoaderComponent, SvgComponent],
	templateUrl: './button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
	icon = input<string>();
	iconTitle = input<string>();
	iconPosition = input<'left' | 'right'>('left');
	iconAriaHidden = input<'true' | 'false'>('true');
	type = input<string>();
	loading = input(false);
	view = input<'button' | 'link'>('button');
	mode = input<'primary' | 'secondary' | 'negative' | 'positive' | 'ghost' | 'ghost-positive'>();
	size = input<ButtonSize>();
	disabled = input(false);
	fillModeIcon = input(false);
	textClass = input<string[]>([]);

	@HostBinding('attr.type') get typeAttr(): string | null {
		return this.type() || (this.tag === 'button' ? 'button' : null);
	}

	@HostBinding('class') get componentClass(): string | null {
		const baseClass = this.view() === 'button' ? 'button' : 'link';
		const modeClass = this.mode() && `${baseClass}--${this.mode()}`;
		const sizeClass = this.size() && `${baseClass}--${this.size()}`;
		const disabledClass = this.disabled() && this.tag === 'a' && `${baseClass}--disabled`;
		return ['state', baseClass, modeClass, sizeClass, disabledClass].filter(_ => _).join(' ');
	}

	get tag(): string {
		return this.elementRef.nativeElement.nodeName?.toLowerCase();
	}

	get textClasses() {
		return [this.view() === 'button' ? 'button__text' : 'link__text', ...this.textClass()];
	}

	constructor(public elementRef: ElementRef) {}
}
