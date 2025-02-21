import { Component, ElementRef, HostBinding, Input, OnInit, Renderer2 } from '@angular/core';

@Component({
	selector: '[app-svg]',
	templateUrl: './svg.component.html',
})
export class SvgComponent implements OnInit {
	private _name: string | null = null;
	@Input() get name(): string | null {
		return this._name;
	}
	set name(value: string | null) {
		this._name = value;
		this.appendSvg();
	}
	@Input() title?: string;
	@Input() height: number | null = null;
	@Input() width: number | null = null;
	@Input() ariaHidden: 'true' | 'false' = 'true';

	@HostBinding('attr.role') get role(): string | null {
		return this.title ? 'img' : null;
	}

	@HostBinding('class') class = 'icon';

	@HostBinding('attr.width') get widthAttr(): number | null {
		return this.height || this.width ? this.width : 16;
	}

	@HostBinding('attr.height') get heightAttr(): number | null {
		return this.height || this.width ? this.height : 16;
	}

	@HostBinding('attr.aria-hidden') get ariaHiddenAttr(): string {
		return this.ariaHidden;
	}

	useElement: HTMLElement | null = null;

	constructor(
		private elementRef: ElementRef<SVGElement>,
		private renderer: Renderer2,
	) {}

	ngOnInit(): void {
		this.appendSvg();
	}

	appendSvg() {
		const svgElement: SVGElement = this.elementRef?.nativeElement;

		if (!svgElement) return;

		Object.values(svgElement.children)
			.filter(element => element?.tagName?.toLowerCase() !== 'title')
			.forEach(element => element?.remove());

		if (this.name) {
			this.useElement = this.renderer.createElement('use', 'svg');
			this.renderer.setAttribute(this.useElement, 'href', `assets/sprite.svg#${this.name}`);
			this.renderer.appendChild(this.elementRef.nativeElement, this.useElement);
		}
	}
}
