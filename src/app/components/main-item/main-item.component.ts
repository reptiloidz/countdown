import { Component, Input } from '@angular/core';
import { Point } from 'src/app/interfaces/point.interface';

@Component({
	selector: '[app-main-item]',
	templateUrl: './main-item.component.html',
})
export class MainItemComponent {
	@Input() point!: Point;
}
