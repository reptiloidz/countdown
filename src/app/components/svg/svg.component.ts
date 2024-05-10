import {
	Component,
	ElementRef,
	HostBinding,
	Input,
	OnInit,
	Renderer2,
} from '@angular/core';

@Component({
	selector: '[app-svg]',
	templateUrl: './svg.component.html',
})
export class SvgComponent implements OnInit {
	@Input() name: string | null = null;
	@Input() title?: string;
	@Input() height: number | null = null;
	@Input() width: number | null = null;
	@Input() 'aria-hidden'?: string | null = 'true';

	@HostBinding('attr.role') get role(): string | null {
		return this.title ? 'img' : null;
	}

	@HostBinding('attr.width') get widthAttr(): number | null {
		return this.height || this.width ? this.width : 16;
	}

	@HostBinding('attr.height') get heightAttr(): number | null {
		return this.height || this.width ? this.height : null;
	}

	@HostBinding('attr.aria-hidden') get ariaHidden(): string | null {
		return this['aria-hidden'] || null;
	}

	useElement: HTMLElement | null = null;

	constructor(
		private elementRef: ElementRef<SVGElement>,
		private renderer: Renderer2
	) {}

	ngOnInit(): void {
		const svgElement: SVGElement = this.elementRef?.nativeElement;

		if (!svgElement) return;

		const childElements: Element[] = Object.values(svgElement.children);

		this.useElement?.remove?.();
		this.useElement = null;

		childElements
			.filter((element) => element?.tagName?.toLowerCase() !== 'title')
			.forEach((element) => element?.remove());

		this.useElement = this.renderer.createElement('use');
		this.renderer.setAttribute(
			this.useElement,
			'xlink:href',
			`assets/sprite.svg#${this.name}`
		);
		if (this.useElement) {
			svgElement.append(this.useElement);
		}
	}
}
