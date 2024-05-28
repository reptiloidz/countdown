import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ElementRef,
	HostBinding,
	Input,
	OnDestroy,
	OnInit,
	Renderer2,
	TemplateRef,
} from '@angular/core';

@Component({
	selector: 'app-drop',
	templateUrl: './drop.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropComponent implements OnInit, OnDestroy {
	@HostBinding('class') class = 'drop';

	@ContentChild('buttonTemplate') buttonTemplate:
		| TemplateRef<unknown>
		| undefined;
	@ContentChild('bodyTemplate') bodyTemplate:
		| TemplateRef<unknown>
		| undefined;

	@Input() open = false;
	@Input() dropBodyClass: string | string[] | null = null;

	value = '';
	private documentClickListener: (() => void) | null = null;

	constructor(
		private elementRef: ElementRef,
		private renderer: Renderer2,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.open && this.addDocumentClickListener();
	}

	ngOnDestroy(): void {
		this.removeDocumentClickListener();
	}

	openHandler() {
		this.open = true;
		this.addDocumentClickListener();
	}

	closeHandler() {
		this.open = false;
		this.removeDocumentClickListener();
		this.cdr.detectChanges();
	}

	toggleHandler() {
		if (this.open) {
			this.closeHandler();
		} else {
			this.openHandler();
		}
	}

	private addDocumentClickListener() {
		this.documentClickListener = this.renderer.listen(
			'document',
			'click',
			(event: MouseEvent) => {
				const clickedInside = this.elementRef.nativeElement.contains(
					event.target
				);
				!clickedInside && this.closeHandler();
			}
		);
	}

	private removeDocumentClickListener() {
		if (this.documentClickListener) {
			this.documentClickListener();
			this.documentClickListener = null;
		}
	}
}
