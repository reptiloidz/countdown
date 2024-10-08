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
	TemplateRef,
	ViewChild,
	forwardRef,
	Renderer2,
	ViewContainerRef,
	RendererStyleFlags2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonSize, DropHorizontal, DropVertical } from 'src/app/types';

@Component({
	selector: 'app-drop',
	templateUrl: './drop.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => DropComponent),
			multi: true,
		},
	],
})
export class DropComponent implements OnInit, OnDestroy, ControlValueAccessor {
	@HostBinding('class') get dropClass() {
		return [
			'drop',
			'drop--' + this.vertical,
			'drop--' + this.horizontal,
		].join(' ');
	}

	@ViewChild('buttonTemplateRef', { read: ViewContainerRef })
	buttonTemplateRef: ViewContainerRef | undefined;
	@ContentChild('buttonTemplate') buttonTemplate:
		| TemplateRef<unknown>
		| undefined;
	@ContentChild('bodyTemplate') bodyTemplate:
		| TemplateRef<unknown>
		| undefined;
	@ViewChild('triggerButton', { read: ElementRef })
	defaultTriggerButton!: ElementRef;

	@Input() open = false;
	@Input() vertical: DropVertical = 'bottom';
	@Input() horizontal: DropHorizontal = 'right';
	@Input() icon: string = 'chevron-down';
	@Input() buttonSize!: ButtonSize;
	@Input() buttonClass = '';
	@Input() buttonTitle: string | null = null;
	@Input() dropBodyClass: string | string[] = '';
	@Input() select = false;
	@Input() dropList!: { [key: string]: string };
	@Input() formControlName!: string;
	@Input() titleValue = '';

	value = '';
	private triggerOffsetTop = 0;
	private footerHeight = 0;
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

		const triggerElement = this.buttonTemplate
			? this.buttonTemplateRef?.element.nativeElement.querySelector(
					'button'
			  )
			: this.defaultTriggerButton.nativeElement;
		this.triggerOffsetTop = triggerElement.getBoundingClientRect().top;

		this.footerHeight = parseInt(
			getComputedStyle(document.querySelector('footer') as HTMLElement)
				.height
		);

		this.renderer.setStyle(
			this.elementRef.nativeElement,
			'--drop-max-h',
			window.innerHeight -
				this.triggerOffsetTop -
				this.footerHeight -
				parseInt(
					getComputedStyle(
						this.elementRef.nativeElement as HTMLElement
					).height
				),
			RendererStyleFlags2.DashCase
		);
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

	changeHandler(value: string) {
		this.value = value;
		this.onChange(value);
		this.onTouched();
		this.closeHandler();
	}

	onChange: (value: string) => void = () => {};
	onTouched: () => void = () => {};

	writeValue(value: string): void {
		this.value = value;
	}
	registerOnChange(fn: any): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}
	setDisabledState?(isDisabled: boolean): void {}
}
