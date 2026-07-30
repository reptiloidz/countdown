import { AUTO_STYLE, animate, style, transition, trigger } from '@angular/animations';
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from '../components/board/board.component';
import { DateType, TimeType } from '../types';

@Component({
	selector: 'app-timers',
	standalone: true,
	imports: [CommonModule, BoardComponent],
	templateUrl: './timers.component.html',
	animations: [
		trigger('boardVisibility', [
			transition(
				':enter',
				[
					style({
						transform: 'translateX(100%)',
						opacity: 0,
						width: 0,
						marginLeft: 0,
					}),
					animate(
						'.4s {{delay}}ms cubic-bezier(.1, .79, .24, .95)',
						style({
							transform: AUTO_STYLE,
							opacity: AUTO_STYLE,
							width: AUTO_STYLE,
							marginLeft: 'var(--timers-gap)',
						}),
					),
				],
				{
					params: {
						delay: 0,
					},
				},
			),
			transition(':leave', [
				animate(
					'.4s cubic-bezier(.1, .79, .24, .95)',
					style({
						transform: 'translateX(100%)',
						opacity: 0,
						width: 0,
						marginLeft: 0,
					}),
				),
			]),
		]),
	],
})
export class TimersComponent {
	years = input<DateType>();
	months = input<DateType>();
	days = input<DateType>();
	hours = input.required<TimeType>();
	mins = input.required<TimeType>();
	secs = input.required<TimeType>();
	size = input<'base' | 'sm'>('base');
	yearsLabel = input('Годы');
	monthsLabel = input('Месяцы');
	daysLabel = input('Дни');
	hoursLabel = input('Часы');
	minsLabel = input('Минуты');
	secsLabel = input('Секунды');
	delayValue = input(0);
	delayRandomValue = input<string | number>(0);
	showSec = input(true);
	yearEnterValue = this.randomDelay;
	monthEnterValue = this.randomDelay;
	dayEnterValue = this.randomDelay;

	get randomDelay() {
		return Math.random() * 2000;
	}
}
