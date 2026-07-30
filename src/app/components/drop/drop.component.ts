import { trigger, transition, style, animate } from '@angular/animations';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	ContentChild,
	ElementRef,
	HostBinding,
	input,
	model,
	OnDestroy,
	OnInit,
	output,
	Renderer2,
	RendererStyleFlags2,
	TemplateRef,
	ViewChild,
	ViewContainerRef,
	forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime, fromEvent, merge, Subscription } from 'rxjs';
import { getKeyByValue } from 'src/app/helpers';
import { SelectArray } from 'src/app/interfaces';
import { NotifyService } from 'src/app/services';
import { ButtonSize, DropHorizontal, DropVertical, NgClassType } from 'src/app/types';
import { ButtonComponent } from '../button/button.component';
import { SvgComponent } from '../svg/svg.component';

@Component({
	selector: 'app-drop',
	standalone: true,
	imports: [CommonModule, ButtonComponent, SvgComponent],
	templateUrl: './drop.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => DropComponent),
			multi: true,
		},
	],
	animations: [
		trigger('drop', [
			transition(':enter', [
				style({
					opacity: 0,
					transform: 'translateY(-10px)',
				}),
				animate(
					'.2s',
					style({
						opacity: 1,
						transform: 'translateY(0)',
					}),
				),
			]),
		]),
	],
})
export class DropComponent implements OnInit, OnDestroy, ControlValueAccessor {
	@HostBinding('class') dropClass = 'drop';

	@ViewChild('triggerTemplateRef', { read: ViewContainerRef })
	triggerTemplateRef: ViewContainerRef | undefined;
	@ContentChild('triggerTemplate') triggerTemplate: TemplateRef<unknown> | undefined;
	@ContentChild('bodyTemplate') bodyTemplate: TemplateRef<unknown> | undefined;
	@ContentChild('footerTemplate') footerTemplate: TemplateRef<unknown> | undefined;
	@ViewChild('triggerButton', { read: ElementRef })
	defaultTriggerButton!: ElementRef;
	@ViewChild('selectListRef', { read: ElementRef })
	selectListRef!: ElementRef;

	open = false;
	vertical = input<DropVertical>('auto');
	horizontal = input<DropHorizontal>('right');
	icon = input('chevron-down');
	buttonSize = input<ButtonSize>();
	buttonClass = input<NgClassType>('');
	buttonTitle = input<string | null>(null);
	buttonLabel = input<string | null>(null);
	dropBodyClass = input<string | string[]>('');
	select = input(false);
	dropList = input<SelectArray[]>();
	formControlName = input<string>();
	name = input<string>();
	readonly value = model<string | number>('');
	focusoutClose = input(false);
	showFooter = input(true);
	navClass = input<NgClassType>('drop__nav state');
	innerClass = input<NgClassType>('');
	listButtonTextClass = input('');
	buttonTextClass = input<string[]>([]);
	disabled = input(false);

	dropChanged = output<string | number>();
	dropClosed = output();
	dropOpened = output();

	readonly isListDrop = computed(() => this.select() || (this.dropList()?.length ?? 0) > 0);

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
	private lastTopState = false;
	private documentClickListener: (() => void) | null = null;
	private subscriptions = new Subscription();
	private pendingFrameId: number | null = null;
	private destroyed = false;
	private triggerElement!: HTMLElement;

	constructor(
		private elementRef: ElementRef,
		private renderer: Renderer2,
		private cdr: ChangeDetectorRef,
		private notify: NotifyService,
	) {}

	ngOnInit(): void {
		this.open && this.addDocumentClickListener();
		this.subscriptions.add(
			merge(fromEvent(window, 'resize'), fromEvent(window, 'scroll'))
				.pipe(debounceTime(200))
				.subscribe({
					next: () => {
						if (this.open) {
							this.scheduleFrame(() => {
								this.setHeightParams();
								this.setDropMaxH(this.lastTopState);
							});
						}
					},
				}),
		);
	}

	ngOnDestroy(): void {
		this.destroyed = true;
		this.cancelPendingFrame();
		this.removeDocumentClickListener();
		this.subscriptions.unsubscribe();
	}

	private cancelPendingFrame() {
		if (this.pendingFrameId !== null) {
			cancelAnimationFrame(this.pendingFrameId);
			this.pendingFrameId = null;
		}
	}

	private scheduleFrame(callback: () => void) {
		this.cancelPendingFrame();
		this.pendingFrameId = requestAnimationFrame(() => {
			this.pendingFrameId = null;
			if (this.destroyed) {
				return;
			}
			callback();
		});
	}

	get keyOfValue() {
		return getKeyByValue(this.dropList() ?? [], this.value());
	}

	trackBy(index: number, item: SelectArray): string | number {
		return item.value;
	}

	setHeightParams() {
		this.triggerOffsetTop = this.triggerElement?.getBoundingClientRect().top;
		this.bottomSpace = window.innerHeight - this.triggerOffsetTop - this.footerHeight;
		this.topSpace = this.triggerOffsetTop;
		this.triggerHeight = this.triggerElement && parseInt(getComputedStyle(this.triggerElement).height);
	}

	openHandler() {
		this.open = true;
		this.addDocumentClickListener();

		this.triggerElement = this.triggerTemplate
			? this.triggerTemplateRef?.element.nativeElement.querySelector('button, input')
			: this.defaultTriggerButton.nativeElement;
		this.triggerOffsetLeft = this.triggerElement?.getBoundingClientRect().left;

		this.footerHeight = parseInt(getComputedStyle(document.querySelector('footer') as HTMLElement).height) || 0;

		this.rightSpace = window.innerWidth - this.triggerOffsetLeft;
		this.setHeightParams();
		this.triggerWidth = this.triggerElement && parseInt(getComputedStyle(this.triggerElement).width);

		this.scheduleFrame(() => {
			if (!this.open) {
				return;
			}

			this.dropHeight = this.elementRef.nativeElement.querySelector('.drop__body')?.getBoundingClientRect().height;
			this.dropWidth = this.elementRef.nativeElement.querySelector('.drop__body')?.getBoundingClientRect().width;

			if (
				this.vertical() === 'top' ||
				(this.vertical() === 'auto' &&
					this.dropHeight > this.bottomSpace - this.triggerHeight &&
					this.bottomSpace - this.triggerHeight < this.triggerOffsetTop)
			) {
				this.renderer.addClass(this.elementRef.nativeElement, 'drop--top');

				this.setDropMaxH(true);
			} else {
				this.renderer.addClass(this.elementRef.nativeElement, 'drop--bottom');

				this.setDropMaxH();
			}

			if (
				(this.dropWidth > this.rightSpace - this.triggerWidth &&
					this.rightSpace - this.triggerWidth < this.triggerOffsetLeft &&
					this.horizontal() === 'right') ||
				this.horizontal() === 'left'
			) {
				this.renderer.addClass(this.elementRef.nativeElement, 'drop--left');
			} else {
				this.renderer.addClass(this.elementRef.nativeElement, 'drop--right');
			}

			this.selectListRef?.nativeElement?.querySelector('.drop__item--selected')?.scrollIntoView({
				block: 'nearest',
			});

			this.dropOpened.emit();
		});
	}

	closeHandler() {
		if (!this.open) {
			return;
		}

		this.open = false;
		this.removeDocumentClickListener();
		this.cdr.markForCheck();
		this.dropClosed.emit();

		this.scheduleFrame(() => {
			this.renderer.removeClass(this.elementRef.nativeElement, 'drop--top');
			this.renderer.removeClass(this.elementRef.nativeElement, 'drop--bottom');
			this.renderer.removeClass(this.elementRef.nativeElement, 'drop--left');
			this.renderer.removeClass(this.elementRef.nativeElement, 'drop--right');

			this.renderer.setStyle(this.elementRef.nativeElement, '--drop-max-h', null, RendererStyleFlags2.DashCase);
		});
	}

	setDropMaxH(isTop = false) {
		this.lastTopState = isTop;
		this.renderer.setStyle(
			this.elementRef.nativeElement,
			'--drop-max-h',
			(isTop ? this.topSpace : this.bottomSpace) - this.triggerHeight,
			RendererStyleFlags2.DashCase,
		);
	}

	toggleHandler() {
		if (this.open) {
			this.closeHandler();
		} else {
			this.openHandler();
		}
	}

	addDocumentClickListener() {
		this.documentClickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
			const clickedInside =
				this.elementRef.nativeElement.contains(event.target) || !document.contains(event.target as HTMLElement);
			!clickedInside && !this.notify.notificationsOpened && this.closeHandler();
		});
	}

	private removeDocumentClickListener() {
		if (this.documentClickListener) {
			this.documentClickListener();
			this.documentClickListener = null;
		}
	}

	changeHandler(value: string | number) {
		this.value.set(value);
		this.onChange(value);
		this.onTouched();
		this.closeHandler();
		this.dropChanged.emit(value);
	}

	onChange: (value: string | number) => void = () => {};
	onTouched: () => void = () => {};

	writeValue(value: string): void {
		this.value.set(value);
	}

	registerOnChange(fn: (value: string | number) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState?(_isDisabled: boolean): void {}
}
