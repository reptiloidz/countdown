import {
	animate,
	state,
	style,
	transition,
	trigger,
} from '@angular/animations';
import { Component, HostBinding, Input } from '@angular/core';
import { timer } from 'rxjs';

const ANIMATION_SPEED = 200;

@Component({
	selector: 'app-board',
	templateUrl: './board.component.html',
	animations: [
		trigger('halfTop', [
			state('void', style({ transform: 'rotateX(0)' })),
			state(
				'*',
				style({
					transform:
						'rotateX(90deg) matrix3d(1, 0, 0, 0, 0, .75, 0, .001, 1, 1, .1, .1, .1, .1, 0, 1)',
					boxShadow:
						'var(--board-half-shadow), 0 calc(var(--board-h) / -4) 20px 0 rgba(var(--c-bg-primary), .1)',
				})
			),
			transition(':enter', [
				animate(
					ANIMATION_SPEED + 'ms cubic-bezier(.36,.25,.76,.52)',
					style({
						transform:
							'rotateX(90deg) matrix3d(1, 0, 0, 0, 0, .75, 0, .001, 1, 1, .1, .1, .1, .1, 0, 1)',
						boxShadow:
							'var(--board-half-shadow), 0 calc(var(--board-h) / -4) 20px 0 rgba(var(--c-bg-primary), .1)',
					})
				),
			]),
		]),
		trigger('halfBottom', [
			state(
				'void',
				style({
					transform:
						'rotateX(90deg) matrix3d(1, 0, 0, 0, 0, .75, 0, -.001, 1, 1, .1, .1, .1, .1, 0, 1)',
					boxShadow:
						'0 calc(var(--board-h) / 4) 20px 1px rgba(var(--c-bg-primary), .4)',
				})
			),
			transition(':enter', [
				animate(
					ANIMATION_SPEED + 'ms cubic-bezier(.36,.25,.76,.52)',
					style({
						transform: 'rotateX(0)',
						boxShadow: 'none',
					})
				),
			]),
		]),
	],
})
export class BoardComponent {
	private _value: string | number = '';

	@HostBinding('class') get componentClass() {
		return ['board', this.size === 'sm' && 'board--sm'].join(' ');
	}
	@Input()
	get value(): string | number {
		return this._value;
	}

	set value(val: string | number) {
		this._value = val;
		val && this.switchBoard();
	}
	@Input() size: 'md' | 'sm' = 'md';
	@Input() label = '';
	@Input() delay = true;

	switchTop = false;
	switchBottom = false;

	topStaticValue: string | number = '00';
	topAnimatedValue: string | number = '00';
	bottomStaticValue: string | number = '00';
	bottomAnimatedValue: string | number = '00';
	isFirstValueSwitched = true;

	switchBoard() {
		if (this.isFirstValueSwitched || this.delay) {
			timer(Math.random() * 1000).subscribe(() => {
				this.animateBoard();
			});
		} else {
			this.animateBoard();
		}
	}

	animateBoard() {
		this.topStaticValue = this.value;
		this.switchTop = true;
		timer(ANIMATION_SPEED).subscribe(() => {
			this.switchTop = false;
			this.topAnimatedValue = this.value;

			this.bottomAnimatedValue = this.value;
			this.switchBottom = true;

			this.isFirstValueSwitched = false;

			timer(ANIMATION_SPEED).subscribe(() => {
				this.bottomStaticValue = this.value;
				this.switchBottom = false;
			});
		});
	}
}
