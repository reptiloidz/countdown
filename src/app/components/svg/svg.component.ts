import { ChangeDetectionStrategy, Component, effect, ElementRef, HostBinding, input, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: '[app-svg]',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './svg.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgComponent {
	name = input<string | null | undefined>(null);
	title = input<string>();
	height = input<number | null>(null);
	width = input<number | null>(null);
	ariaHidden = input<'true' | 'false'>('true');

	@HostBinding('attr.role') get role(): string | null {
		return this.title() ? 'img' : null;
	}

	@HostBinding('class') class = 'icon';

	@HostBinding('attr.width') get widthAttr(): number | null {
		return this.height() || this.width() ? this.width() : 16;
	}

	@HostBinding('attr.height') get heightAttr(): number | null {
		return this.height() || this.width() ? this.height() : 16;
	}

	@HostBinding('attr.aria-hidden') get ariaHiddenAttr(): string {
		return this.ariaHidden();
	}

	useElement: HTMLElement | null = null;

	constructor(
		private elementRef: ElementRef<SVGElement>,
		private renderer: Renderer2,
	) {
		effect(() => {
			this.name();
			this.appendSvg();
		});
	}

	appendSvg() {
		const svgElement: SVGElement = this.elementRef?.nativeElement;

		if (!svgElement) return;

		Object.values(svgElement.children)
			.filter(element => element?.tagName?.toLowerCase() !== 'title')
			.forEach(element => element?.remove());

		const iconName = this.name();
		if (iconName) {
			this.useElement = this.renderer.createElement('use', 'svg');
			this.renderer.setAttribute(this.useElement, 'href', `assets/sprite.svg#${iconName}`);
			this.renderer.appendChild(this.elementRef.nativeElement, this.useElement);
		}
	}
}
