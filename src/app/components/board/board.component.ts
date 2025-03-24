import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostBinding,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	SimpleChanges,
} from '@angular/core';
import { filter, timer } from 'rxjs';

const ANIMATION_SPEED = 200;

@Component({
	selector: 'app-board',
	templateUrl: './board.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements OnInit, OnChanges, OnDestroy {
	@HostBinding('class') get componentClass() {
		return ['board', this.mode !== 'base' ? `board--${this.mode}` : null].filter(_ => _).join(' ');
	}

	@Input() value: string | number = '';
	@Input() initialValue: string | number = '00';
	@Input() mode: 'base' | 'sm' | 'logo' = 'base';
	@Input() label = '';
	@Input() delay = true;
	@Input() delayValue!: number;
	@Input() delayRandomValue!: string | number;

	switchTop = false;
	switchBottom = false;
	hasInitialSwitched = false;
	topStaticValue: string | number = this.initialValue;
	topAnimatedValue: string | number = this.initialValue;
	bottomStaticValue: string | number = this.initialValue;
	bottomAnimatedValue: string | number = this.initialValue;
	timeInterval = new Date();
	intersectionCallback!: IntersectionObserverCallback;
	intersectionObserver!: IntersectionObserver;

	constructor(
		private el: ElementRef,
		private cdr: ChangeDetectorRef,
	) {}

	ngOnInit(): void {
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

	ngOnChanges(changes: SimpleChanges) {
		if (changes['initialValue']) {
			this.topStaticValue =
				this.topAnimatedValue =
				this.bottomStaticValue =
				this.bottomAnimatedValue =
					this.initialValue;
		}
		changes['value']?.currentValue && this.switchBoard();
	}

	ngOnDestroy(): void {
		if (this.intersectionObserver) {
			this.intersectionObserver.disconnect();
		}
	}

	switchBoard() {
		if (this.delay) {
			timer(this.delayValue || Math.random() * (+this.delayRandomValue || 1000))
				.pipe(filter(() => this.hasInitialSwitched || this.initialValue !== this.value))
				.subscribe(() => {
					this.animateBoard();
				});
		} else {
			this.animateBoard();
		}
	}

	animateBoard() {
		this.hasInitialSwitched = true;
		this.topStaticValue = this.value;
		this.switchTop = true;
		timer(ANIMATION_SPEED).subscribe(() => {
			this.switchTop = false;
			this.topAnimatedValue = this.value;

			this.bottomAnimatedValue = this.value;
			this.switchBottom = true;

			timer(ANIMATION_SPEED).subscribe(() => {
				this.bottomStaticValue = this.value;
				this.switchBottom = false;
			});
			this.cdr.detectChanges();
		});
	}
}
