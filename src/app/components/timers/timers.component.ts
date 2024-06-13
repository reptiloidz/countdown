import {
	AUTO_STYLE,
	animate,
	style,
	transition,
	trigger,
} from '@angular/animations';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-timers',
	templateUrl: './timers.component.html',
	animations: [
		trigger('boardVisibility', [
			transition(':enter', [
				style({
					transform: 'translateX(100%)',
					opacity: 0,
					width: 0,
					marginLeft: 0,
				}),
				animate(
					'.4s cubic-bezier(.1, .79, .24, .95)',
					style({
						transform: AUTO_STYLE,
						opacity: AUTO_STYLE,
						width: AUTO_STYLE,
						marginLeft: 'var(--timers-gap)',
					})
				),
			]),
			transition(':leave', [
				animate(
					'.4s cubic-bezier(.1, .79, .24, .95)',
					style({
						transform: 'translateX(100%)',
						opacity: 0,
						width: 0,
						marginLeft: 0,
					})
				),
			]),
		]),
	],
})
export class TimersComponent {
	@Input() years: number | string | undefined;
	@Input() months: number | string | undefined;
	@Input() days: number | string | undefined;
	@Input() hours!: number | string;
	@Input() mins!: number | string;
	@Input() secs!: number | string;
	@Input() size: 'md' | 'sm' = 'md';
	@Input() yearsLabel = 'Годы';
	@Input() monthsLabel = 'Месяцы';
	@Input() daysLabel = 'Дни';
	@Input() hoursLabel = 'Часы';
	@Input() minsLabel = 'Минуты';
	@Input() secsLabel = 'Секунды';
}
