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
	Output,
	EventEmitter,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { getKeyByValue } from 'src/app/helpers';
import { SelectArray } from 'src/app/interfaces';
import { NotifyService } from 'src/app/services';
import {
	ButtonSize,
	DropHorizontal,
	DropVertical,
	NgClassType,
} from 'src/app/types';

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
			this.vertical === 'auto' ? '' : 'drop--' + this.vertical,
		].join(' ');
	}

	@ViewChild('triggerTemplateRef', { read: ViewContainerRef })
	triggerTemplateRef: ViewContainerRef | undefined;
	@ContentChild('triggerTemplate') triggerTemplate:
		| TemplateRef<unknown>
		| undefined;
	@ContentChild('bodyTemplate') bodyTemplate:
		| TemplateRef<unknown>
		| undefined;
	@ContentChild('footerTemplate') footerTemplate:
		| TemplateRef<unknown>
		| undefined;
	@ViewChild('triggerButton', { read: ElementRef })
	defaultTriggerButton!: ElementRef;
	@ViewChild('selectListRef', { read: ElementRef })
	selectListRef!: ElementRef;

	@Input() open = false;
	@Input() vertical: DropVertical = 'auto';
	@Input() horizontal: DropHorizontal = 'right';
	@Input() icon: string = 'chevron-down';
	@Input() buttonSize!: ButtonSize;
	@Input() buttonClass = '';
	@Input() buttonTitle: string | null = null;
	@Input() buttonLabel: string | null = null;
	@Input() dropBodyClass: string | string[] = '';
	@Input() select = false;
	@Input() dropList!: SelectArray[];
	@Input() formControlName!: string;
	@Input() name!: string;
	@Input() value: string | number = '';
	@Input() focusoutClose = false;
	@Input() showFooter = true;
	@Input() navClass: NgClassType = 'drop__nav';
	@Input() innerClass: NgClassType = '';
	@Input() listButtonTextClass = '';
	@Input() buttonTextClass: string[] = [];

	@Output() dropChanged = new EventEmitter<string | number>();
	@Output() dropClosed = new EventEmitter();

	private triggerOffsetTop = 0;
	private triggerOffsetLeft = 0;
	private footerHeight = 0;
	private dropHeight = 0;
	private dropWidth = 0;
	private triggerHeight = 0;
	private triggerWidth = 0;
	private bottomSpace = 0;
	private topSpace = 0;
	private rightSpace = 0;
	private documentClickListener: (() => void) | null = null;

	constructor(
		private elementRef: ElementRef,
		private renderer: Renderer2,
		private cdr: ChangeDetectorRef,
		private notify: NotifyService
	) {}

	ngOnInit(): void {
		this.open && this.addDocumentClickListener();
	}

	ngOnDestroy(): void {
		this.removeDocumentClickListener();
	}

	get keyOfValue() {
		return getKeyByValue(this.dropList, this.value);
	}

	openHandler() {
		this.open = true;
		this.addDocumentClickListener();

		const triggerElement = this.triggerTemplate
			? this.triggerTemplateRef?.element.nativeElement.querySelector(
					'button, input'
			  )
			: this.defaultTriggerButton.nativeElement;
		this.triggerOffsetTop = triggerElement.getBoundingClientRect().top;
		this.triggerOffsetLeft = triggerElement.getBoundingClientRect().left;

		this.footerHeight =
			parseInt(
				getComputedStyle(
					document.querySelector('footer') as HTMLElement
				).height
			) || 0;

		this.bottomSpace =
			window.innerHeight - this.triggerOffsetTop - this.footerHeight;
		this.topSpace = this.triggerOffsetTop;
		this.rightSpace = window.innerWidth - this.triggerOffsetLeft;

		this.triggerHeight = parseInt(getComputedStyle(triggerElement).height);
		this.triggerWidth = parseInt(getComputedStyle(triggerElement).width);

		requestAnimationFrame(() => {
			this.dropHeight = this.elementRef.nativeElement
				.querySelector('.drop__body')
				?.getBoundingClientRect().height;
			this.dropWidth = this.elementRef.nativeElement
				.querySelector('.drop__body')
				?.getBoundingClientRect().width;

			// Позиционирование по вертикали
			if (
				this.dropHeight > this.bottomSpace - this.triggerHeight &&
				this.bottomSpace - this.triggerHeight < this.triggerOffsetTop
			) {
				if (this.vertical === 'auto') {
					this.renderer.addClass(
						this.elementRef.nativeElement,
						'drop--top'
					);
				}
				this.setDropMaxH(true);
			} else {
				this.renderer.addClass(
					this.elementRef.nativeElement,
					'drop--bottom'
				);

				this.setDropMaxH();
			}

			// Позиционирование по горизонтали
			if (
				(this.dropWidth > this.rightSpace - this.triggerWidth &&
					this.rightSpace - this.triggerWidth <
						this.triggerOffsetLeft &&
					this.horizontal === 'right') ||
				this.horizontal === 'left'
			) {
				this.renderer.addClass(
					this.elementRef.nativeElement,
					'drop--left'
				);
			} else {
				this.renderer.addClass(
					this.elementRef.nativeElement,
					'drop--right'
				);
			}

			this.selectListRef?.nativeElement
				?.querySelector('.drop__item--selected')
				?.scrollIntoView({
					block: 'nearest',
				});
		});
	}

	closeHandler() {
		this.open = false;
		this.removeDocumentClickListener();
		this.cdr.detectChanges();

		requestAnimationFrame(() => {
			if (this.vertical === 'auto') {
				this.renderer.removeClass(
					this.elementRef.nativeElement,
					'drop--top'
				);
				this.renderer.removeClass(
					this.elementRef.nativeElement,
					'drop--bottom'
				);
			}

			this.renderer.removeClass(
				this.elementRef.nativeElement,
				'drop--left'
			);
			this.renderer.removeClass(
				this.elementRef.nativeElement,
				'drop--right'
			);

			this.renderer.setStyle(
				this.elementRef.nativeElement,
				'--drop-max-h',
				null,
				RendererStyleFlags2.DashCase
			);
			this.dropClosed.emit();
		});
	}

	setDropMaxH(isTop = false) {
		this.renderer.setStyle(
			this.elementRef.nativeElement,
			'--drop-max-h',
			(isTop ? this.topSpace : this.bottomSpace) - this.triggerHeight,
			RendererStyleFlags2.DashCase
		);
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
				const clickedInside =
					this.elementRef.nativeElement.contains(event.target) ||
					!document.contains(event.target as HTMLElement);
				!clickedInside &&
					!this.notify.notificationsOpened &&
					this.closeHandler();
			}
		);
	}

	private removeDocumentClickListener() {
		if (this.documentClickListener) {
			this.documentClickListener();
			this.documentClickListener = null;
		}
	}

	changeHandler(value: string | number) {
		this.value = value;
		this.onChange(value);
		this.onTouched();
		this.closeHandler();
		this.dropChanged.emit(value);
	}

	onChange: (value: string | number) => void = () => {};
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
