import { AUTO_STYLE, animate, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { DateType, TimeType } from '../types';

@Component({
	selector: 'app-timers',
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
	@Input() years: DateType;
	@Input() months: DateType;
	@Input() days: DateType;
	@Input() hours!: TimeType;
	@Input() mins!: TimeType;
	@Input() secs!: TimeType;
	@Input() size: 'base' | 'sm' = 'base';
	@Input() yearsLabel = 'Годы';
	@Input() monthsLabel = 'Месяцы';
	@Input() daysLabel = 'Дни';
	@Input() hoursLabel = 'Часы';
	@Input() minsLabel = 'Минуты';
	@Input() secsLabel = 'Секунды';
	@Input() delayValue!: number;
	@Input() delayRandomValue!: string | number;
	@Input() showSec = true;
	yearEnterValue = this.randomDelay;
	monthEnterValue = this.randomDelay;
	dayEnterValue = this.randomDelay;

	get randomDelay() {
		return Math.random() * 2000;
	}
}
