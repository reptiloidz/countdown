import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	effect,
	ElementRef,
	HostBinding,
	inject,
	input,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter, timer } from 'rxjs';

const ANIMATION_SPEED = 200;

@Component({
	selector: 'app-board',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './board.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements OnInit, OnDestroy {
	value = input<string | number>('');
	initialValue = input<string | number>('00');
	mode = input<'base' | 'sm' | 'logo'>('base');
	label = input('');
	delay = input(true);
	delayValue = input(0);
	delayRandomValue = input<string | number>(0);
	boardHalfClass = input('');

	@HostBinding('class') get componentClass() {
		return ['board', this.mode() !== 'base' ? `board--${this.mode()}` : null].filter(_ => _).join(' ');
	}

	switchTop = false;
	switchBottom = false;
	hasInitialSwitched = false;
	topStaticValue: string | number = '00';
	topAnimatedValue: string | number = '00';
	bottomStaticValue: string | number = '00';
	bottomAnimatedValue: string | number = '00';
	timeInterval = new Date();
	intersectionCallback!: IntersectionObserverCallback;
	intersectionObserver!: IntersectionObserver;

	private readonly el = inject(ElementRef);
	private readonly cdr = inject(ChangeDetectorRef);

	constructor() {
		effect(() => {
			const init = this.initialValue();
			this.topStaticValue = this.topAnimatedValue = this.bottomStaticValue = this.bottomAnimatedValue = init;
		});

		effect(() => {
			const v = this.value();
			if (v) {
				this.switchBoard();
			}
		});
	}

	ngOnInit(): void {
		this.topStaticValue =
			this.topAnimatedValue =
			this.bottomStaticValue =
			this.bottomAnimatedValue =
				this.initialValue();

		this.intersectionCallback = (entries: IntersectionObserverEntry[]) => {
			entries.forEach(entry => {
				entry.isIntersecting
					? (entry.target as HTMLElement).classList.add('board--visible')
					: (entry.target as HTMLElement).classList.remove('board--visible');
			});
		};

		this.intersectionObserver = new IntersectionObserver(this.intersectionCallback, {
			threshold: 0,
			rootMargin: '-80px 0px -90px 0px',
		});

		this.intersectionObserver.observe(this.el.nativeElement);
	}

	ngOnDestroy(): void {
		if (this.intersectionObserver) {
			this.intersectionObserver.disconnect();
		}
	}

	switchBoard() {
		if (this.delay()) {
			timer(this.delayValue() || Math.random() * (+this.delayRandomValue() || 1000))
				.pipe(filter(() => this.hasInitialSwitched || this.initialValue() !== this.value()))
				.subscribe(() => {
					this.animateBoard();
				});
		} else {
			this.animateBoard();
		}
	}

	animateBoard() {
		this.hasInitialSwitched = true;
		const nextValue = this.value();
		this.topStaticValue = nextValue;
		this.switchTop = true;
		timer(ANIMATION_SPEED).subscribe(() => {
			this.switchTop = false;
			this.topAnimatedValue = nextValue;

			this.bottomAnimatedValue = nextValue;
			this.switchBottom = true;

			timer(ANIMATION_SPEED).subscribe(() => {
				this.bottomStaticValue = nextValue;
				this.switchBottom = false;
			});
			this.cdr.markForCheck();
		});
	}
}
